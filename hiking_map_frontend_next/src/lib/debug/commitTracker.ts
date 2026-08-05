/**
 * 真正的 render 計數：掛進 React 的 commit 流程。
 *
 * React 在初始化時會找 `window.__REACT_DEVTOOLS_GLOBAL_HOOK__`，之後每次把畫面
 * 寫進 DOM（commit）都會呼叫它的 onCommitFiberRoot。DevTools 與 react-scan 用的
 * 都是這個掛鉤點——沒有文件、不是公開 API，所以全部包在 try/catch 裡。
 *
 * 掛鉤必須在 React 載入前就位，因此註冊的動作寫在 layout 的 <head> script
 * （見 COMMIT_HOOK_INSTALLER），這個檔案只負責訂閱它留下的佇列。
 */

type Fiber = {
  type: unknown;
  flags?: number;
  /** dev build 才有：這個 fiber 這一輪開始 render 的時間（performance.now()） */
  actualStartTime?: number;
  child: Fiber | null;
  sibling: Fiber | null;
  alternate?: Fiber | null;
};

type FiberRoot = { current: Fiber };

declare global {
  interface Window {
    __DEBUG_COMMIT_LISTENERS__?: ((root: FiberRoot) => void)[];
  }
}

/** 單次 commit 最多走訪的節點數，避免極端情況下拖慢頁面 */
const MAX_NODES_PER_COMMIT = 8000;

const renderLog = new WeakMap<object, { count: number; at: number; lastStart: number }>();

let installed = false;

/**
 * 在 <head> 同步執行，必須早於 React。
 * 若使用者已安裝 React DevTools，這裡會保留原本的 onCommitFiberRoot 再往下傳，
 * 兩邊才能並存。
 */
export const COMMIT_HOOK_INSTALLER = `(function () {
  var key = '__REACT_DEVTOOLS_GLOBAL_HOOK__';
  var hook = window[key];
  if (!hook) {
    hook = window[key] = {
      renderers: new Map(),
      supportsFiber: true,
      inject: function (renderer) { var id = this.renderers.size + 1; this.renderers.set(id, renderer); return id; },
      onCommitFiberRoot: function () {},
      onPostCommitFiberRoot: function () {},
      onCommitFiberUnmount: function () {},
      checkDCE: function () {},
    };
  }
  window.__DEBUG_COMMIT_LISTENERS__ = window.__DEBUG_COMMIT_LISTENERS__ || [];
  var original = hook.onCommitFiberRoot;
  hook.onCommitFiberRoot = function (id, root) {
    try { window.__DEBUG_COMMIT_LISTENERS__.forEach(function (fn) { fn(root); }); } catch (e) {}
    if (original) return original.apply(this, arguments);
  };
})();`;

/**
 * commit 之後把這一輪真的重新執行過的 fiber 記下來。
 *
 * 判斷依據是 actualStartTime 有沒有往前走。不能用 `flags & PerformedWork`：
 * 被 bail out 跳過的子樹不會被複製，那些 fiber 身上還留著上一輪的 flags，
 * 每個 commit 都會被重複算成「render 過」——不相干的元件計數會一起長。
 */
function recordCommit(root: FiberRoot) {
  const at = Date.now();
  const stack: Fiber[] = [root.current];
  let visited = 0;

  while (stack.length > 0 && visited < MAX_NODES_PER_COMMIT) {
    const fiber = stack.pop()!;
    visited += 1;

    const startTime = fiber.actualStartTime;
    if (typeof fiber.type !== 'string' && typeof startTime === 'number' && startTime > 0) {
      const previous = renderLog.get(fiber as object);

      if (previous === undefined || startTime > previous.lastStart) {
        const entry = { count: (previous?.count ?? 0) + 1, at, lastStart: startTime };
        renderLog.set(fiber as object, entry);
        // render 之間 React 會在兩個 fiber 之間輪替，兩邊都記才不會數到一半歸零
        if (fiber.alternate) renderLog.set(fiber.alternate as object, entry);
      }
    }

    let child = fiber.child;
    while (child) {
      stack.push(child);
      child = child.sibling;
    }
  }
}

/** 沒掛上的話（例如 production build 沒有注入 script）計數會一直是 0 */
export function isCommitTrackerActive(): boolean {
  return installed;
}

export function installCommitTracker() {
  if (installed || typeof window === 'undefined') return;
  if (!Array.isArray(window.__DEBUG_COMMIT_LISTENERS__)) return;

  window.__DEBUG_COMMIT_LISTENERS__.push(recordCommit);
  installed = true;
}

export function getRenderInfo(fiber: object): { renderCount: number; renderedAt: number } {
  const entry = renderLog.get(fiber);
  return { renderCount: entry?.count ?? 0, renderedAt: entry?.at ?? 0 };
}
