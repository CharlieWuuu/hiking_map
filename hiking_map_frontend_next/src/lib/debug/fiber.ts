/**
 * 從 React 內部的 fiber tree 讀出「畫面上有哪些元件、各自佔哪塊區域」。
 *
 * 這是 React DevTools 用的同一套資料，但它不是公開 API——React 換版本時
 * 結構可能改變。所以整段都包在 try/catch 裡，讀不到就當作沒有元件，
 * 只影響 debug 疊層，不會弄壞畫面。
 *
 * Server component 不存在於瀏覽器的 fiber tree（送到前端的只有它產生的
 * HTML），所以光看 fiber.type 只找得到 client component。React 19 會把
 * 產生這段畫面的 server component 記在 fiber._debugInfo，兩邊合起來才是
 * 完整的元件樹。
 */

import { getRenderInfo } from './commitTracker';

type DebugInfoEntry = { name?: string; env?: string };

type Hook = { memoizedState: unknown; queue: unknown; next: Hook | null };

type Fiber = {
  type: unknown;
  stateNode: unknown;
  child: Fiber | null;
  sibling: Fiber | null;
  return: Fiber | null;
  memoizedProps?: unknown;
  memoizedState?: unknown;
  _debugInfo?: DebugInfoEntry[] | null;
  /** 誰在自己的 JSX 裡寫下這個元素（不是父節點，是「擁有者」） */
  _debugOwner?: Fiber | null;
};

export type ComponentBox = {
  name: string;
  kind: 'server' | 'client';
  /** 同一個位置上有多個元件時，用來把標籤往上疊 */
  labelIndex: number;
  rect: { top: number; left: number; width: number; height: number };
  /** server component 在瀏覽器沒有實體，拿不到 props 與 state */
  props: unknown;
  hookStates: unknown[] | null;
  /** 對應 hookStates 的變數名稱，讀不到就是 null */
  hookNames: (string | null)[] | null;
  /** 這個元件實際重新執行的次數，以及最後一次的時間戳（0 = 掛載後沒再 render 過） */
  renderCount: number;
  renderedAt: number;
  /** 這個元件最外層那個 DOM 節點，用來對照實際套到的樣式 */
  dom: { tag: string; className: string } | null;
  /** 是誰把這個元件寫進 JSX 的 */
  owner: string | null;
};

const MAX_HOOKS = 50;

/** 一頁的 DOM 節點動輒上千個，只畫看得到的那些 */
const MAX_DOM_BOXES = 400;
const MIN_DOM_SIZE = 8;

export type DomBox = {
  name: string;
  labelIndex: number;
  rect: { top: number; left: number; width: number; height: number };
};

/**
 * 只用標籤本身的語意來描述：`input[type=password]`、`div#app`。
 * 不放 className——Tailwind 的 class 是一長串 utility，貼在畫面上只會變雜訊。
 */
function describeElement(element: Element): string {
  const tag = element.tagName.toLowerCase();
  if (element.id) return `${tag}#${element.id}`;
  if (element instanceof HTMLInputElement) return `${tag}[type=${element.type}]`;
  return tag;
}

/**
 * 直接走 DOM，不經過 fiber——因為要看的就是「元件底下那些沒有名字的原生標籤」，
 * 它們在 fiber tree 裡只是字串 type，沒有元件名可以顯示。
 */
export function collectDomBoxes(): DomBox[] {
  const boxes: DomBox[] = [];
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;

  for (const element of Array.from(document.body.querySelectorAll<HTMLElement>('*'))) {
    if (boxes.length >= MAX_DOM_BOXES) break;
    // 疊層自己的 DOM 不用畫
    if (element.closest('[data-debug-overlay]')) continue;
    if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') continue;

    const rect = element.getBoundingClientRect();
    if (rect.width < MIN_DOM_SIZE || rect.height < MIN_DOM_SIZE) continue;
    if (rect.bottom < 0 || rect.top > viewportHeight || rect.right < 0 || rect.left > viewportWidth) continue;

    boxes.push({
      name: describeElement(element),
      labelIndex: 0,
      rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
    });
  }

  return assignLabelIndexes(boxes);
}

/**
 * 很多節點會共用同一塊區域（例如只包一層的 wrapper）。
 * 標籤依區域分組後往上疊，否則會全部畫在同一個位置互相蓋住。
 */
function assignLabelIndexes<T extends { labelIndex: number; rect: { top: number; left: number; width: number; height: number } }>(boxes: T[]): T[] {
  const perRect = new Map<string, number>();

  for (const box of boxes) {
    const key = `${Math.round(box.rect.top)}:${Math.round(box.rect.left)}:${Math.round(box.rect.width)}:${Math.round(box.rect.height)}`;
    const used = perRect.get(key) ?? 0;
    box.labelIndex = used;
    perRect.set(key, used + 1);
  }

  return boxes;
}

/**
 * 函式元件的 hook 是一條鏈結串列，沒有名字。有 queue 的才是會觸發重繪的
 * useState / useReducer，其餘（useRef、useEffect、useMemo…）跳過。
 */
function getHookStates(fiber: Fiber): unknown[] {
  const states: unknown[] = [];
  let hook = fiber.memoizedState as Hook | null;
  let guard = 0;

  while (hook && guard < MAX_HOOKS) {
    if (hook.queue) states.push(hook.memoizedState);
    hook = hook.next;
    guard += 1;
  }

  return states;
}

/**
 * `const [username, setUsername] = useState('')` 之類的宣告。
 * 編譯後呼叫端可能長成 `useState(...)`、`_react.useState(...)`、`(0, _react.useState)(...)`，
 * 所以呼叫的部分抓寬一點，之後再確認裡面有沒有 useState / useReducer。
 */
const STATE_HOOK_DECLARATION = /(?:const|let|var)\s*\[\s*([\w$]+)\s*(?:,\s*[\w$]+\s*)?\]\s*=\s*([^;\n]+)/g;

const hookNameCache = new WeakMap<object, (string | null)[] | null>();

/**
 * hook 在 runtime 沒有名字，但 dev 環境下元件函式的原始碼還在，
 * 直接從 `fn.toString()` 把解構出來的變數名依序讀出來。
 *
 * 只有在數量跟實際的 state hook 完全對得起來時才採用——元件若透過自訂 hook
 * 間接產生 state，文字上讀不到那一筆，順序就會整個錯開，那還不如不標。
 */
function getStateHookNames(type: unknown, hookCount: number): (string | null)[] | null {
  if (typeof type !== 'function') return null;

  const cached = hookNameCache.get(type);
  if (cached !== undefined) return cached?.length === hookCount ? cached : null;

  let names: (string | null)[] | null = null;
  try {
    const source = Function.prototype.toString.call(type);
    const found: string[] = [];
    STATE_HOOK_DECLARATION.lastIndex = 0;

    let match = STATE_HOOK_DECLARATION.exec(source);
    while (match) {
      if (/\buse(State|Reducer)\b/.test(match[2])) found.push(match[1]);
      match = STATE_HOOK_DECLARATION.exec(source);
    }

    names = found;
  } catch {
    names = null;
  }

  hookNameCache.set(type, names);
  return names?.length === hookCount ? names : null;
}

/** Next.js、React、i18n 自己的內部元件，列出來只會蓋滿畫面 */
const FRAMEWORK_COMPONENTS =
  /^(Root|ServerRoot|AppRouter|Router|RootErrorBoundary|ErrorBoundary|ErrorBoundaryHandler|HotReload|AppDevOverlay.*|DevRoot.*|HTTPAccessFallback.*|Redirect(Error)?Boundary|NotFound(Error)?Boundary|LoadingBoundary|OutletBoundary|Metadata.*|Viewport.*|Next\..*|AppRouterAnnouncer|__next.*|Outer|OuterLayoutRouter|InnerLayoutRouter|Segment.*|Inner(Scroll|Layout).*|ScrollAndMaybeFocusHandler|ScrollAndFocusHandler|RenderFromTemplateContext|ClientPageRoot|ClientSegmentRoot|NextIntlClientProvider(Server)?|IntlProvider|DebugProvider|DebugOverlay|LayoutRouter.*|ActivityBoundary|LinkComponent|BaseLink|Image|LinkStatus|.*Context|AppReveal|Debug.*)$/;

function getComponentName(type: unknown): string | null {
  if (typeof type === 'function') {
    const fn = type as { displayName?: string; name?: string };
    return fn.displayName || fn.name || null;
  }

  if (typeof type === 'object' && type !== null) {
    const obj = type as { displayName?: string; render?: unknown; type?: unknown };
    if (obj.displayName) return obj.displayName;
    // forwardRef 包一層 render、memo 包一層 type
    if (obj.render) return getComponentName(obj.render);
    if (obj.type) return getComponentName(obj.type);
  }

  return null;
}

function getRootFiber(): Fiber | null {
  const candidates: Element[] = [document.documentElement, document.body, ...Array.from(document.body.children)];

  for (const element of candidates) {
    for (const key of Object.keys(element)) {
      if (key.startsWith('__reactContainer$')) {
        return (element as unknown as Record<string, Fiber>)[key];
      }
      if (key.startsWith('__reactFiber$')) {
        let fiber = (element as unknown as Record<string, Fiber>)[key];
        while (fiber.return) fiber = fiber.return;
        return fiber;
      }
    }
  }

  return null;
}

/**
 * 收集這個元件底下最外層的那些真實 DOM 節點。
 * 碰到 host 節點就停，不再往下鑽——它的範圍已經涵蓋所有子孫。
 */
function collectHostNodes(fiber: Fiber, out: HTMLElement[]) {
  if (typeof fiber.type === 'string' && fiber.stateNode instanceof HTMLElement) {
    out.push(fiber.stateNode);
    return;
  }

  let child = fiber.child;
  while (child) {
    collectHostNodes(child, out);
    child = child.sibling;
  }
}

function unionRect(nodes: HTMLElement[]) {
  let top = Infinity;
  let left = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;

  for (const node of nodes) {
    const rect = node.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) continue;
    top = Math.min(top, rect.top);
    left = Math.min(left, rect.left);
    right = Math.max(right, rect.right);
    bottom = Math.max(bottom, rect.bottom);
  }

  if (top === Infinity) return null;
  return { top, left, width: right - left, height: bottom - top };
}

function isVisibleName(name: string | null | undefined, includeFramework: boolean): name is string {
  if (!name) return false;
  if (!/^[A-Z]/.test(name)) return false;
  return includeFramework || !FRAMEWORK_COMPONENTS.test(name);
}

export function collectComponentBoxes(options: { includeFramework: boolean }): ComponentBox[] {
  try {
    const root = getRootFiber();
    if (!root) return [];

    const boxes: ComponentBox[] = [];
    const stack: Fiber[] = [root];

    while (stack.length > 0) {
      const fiber = stack.pop()!;

      // 同一個 fiber 上可能同時有 server 來源與 client 元件名
      const labels: Omit<ComponentBox, 'labelIndex' | 'rect' | 'dom'>[] = [];

      for (const entry of fiber._debugInfo ?? []) {
        if (entry?.env === 'Server' && isVisibleName(entry.name, options.includeFramework)) {
          // server component 不會在瀏覽器重新執行，沒有 render 次數可言
          labels.push({ name: entry.name, kind: 'server', props: null, hookStates: null, hookNames: null, owner: null, renderCount: 0, renderedAt: 0 });
        }
      }

      if (typeof fiber.type !== 'string') {
        const name = getComponentName(fiber.type);
        if (isVisibleName(name, options.includeFramework)) {
          const hookStates = typeof fiber.type === 'function' ? getHookStates(fiber) : null;
          const props = fiber.memoizedProps ?? null;
          labels.push({
            name,
            kind: 'client',
            props,
            hookStates,
            hookNames: hookStates ? getStateHookNames(fiber.type, hookStates.length) : null,
            owner: fiber._debugOwner ? getComponentName(fiber._debugOwner.type) : null,
            ...getRenderInfo(fiber as object),
          });
        }
      }

      if (labels.length > 0) {
        const nodes: HTMLElement[] = [];
        let child = fiber.child;
        while (child) {
          collectHostNodes(child, nodes);
          child = child.sibling;
        }

        const rect = unionRect(nodes);
        if (rect && rect.width > 0 && rect.height > 0) {
          const first = nodes[0];
          const dom = first ? { tag: first.tagName.toLowerCase(), className: typeof first.className === 'string' ? first.className : '' } : null;
          for (const label of labels) {
            boxes.push({ ...label, labelIndex: 0, rect, dom });
          }
        }
      }

      let child = fiber.child;
      while (child) {
        stack.push(child);
        child = child.sibling;
      }
    }

    return assignLabelIndexes(boxes);
  } catch {
    return [];
  }
}
