'use client';

import { useEffect, useMemo, useState } from 'react';

import { installCommitTracker, isCommitTrackerActive } from './commitTracker';
import { useDebugMode } from './DebugContext';
import DebugPanel from './DebugPanel';
import { collectComponentBoxes, collectDomBoxes, type ComponentBox, type DomBox } from './fiber';

const COLORS = {
  server: 'hsl(190 100% 55%)',
  client: 'hsl(330 100% 62%)',
} as const;

const DOM_COLOR = 'hsl(45 100% 60%)';
const RENDER_COLOR = 'hsl(85 100% 55%)';

/** 剛 render 過的元件亮起來的時間 */
const FLASH_MS = 1200;

const REFRESH_INTERVAL_MS = 500;
const LABEL_MIN_WIDTH = 48;
const LABEL_MIN_HEIGHT = 18;
const LABEL_HEIGHT = 14;

function area(box: ComponentBox) {
  return box.rect.width * box.rect.height;
}

export default function DebugOverlay() {
  const { isDebugMode } = useDebugMode();
  const [boxes, setBoxes] = useState<ComponentBox[]>([]);
  const [domBoxes, setDomBoxes] = useState<DomBox[]>([]);
  // 每次掃描時一起記下當下時間，render 階段才不用呼叫 Date.now()（不純）
  const [measuredAt, setMeasuredAt] = useState(0);
  const [showDomLabels, setShowDomLabels] = useState(false);
  const [includeFramework, setIncludeFramework] = useState(false);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const [pinnedIndex, setPinnedIndex] = useState<number | null>(null);
  const [showOutlines, setShowOutlines] = useState(true);
  const [showDomOutlines, setShowDomOutlines] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  // 框完全重疊時游標選不到內層，改成可以直接點標籤
  const [hoveredLabelIndex, setHoveredLabelIndex] = useState<number | null>(null);

  // 游標所在、面積最小的那個框才是真正指到的元件
  const hoveredIndex = useMemo(() => {
    if (!pointer) return null;
    let best: number | null = null;
    boxes.forEach((box, index) => {
      const { top, left, width, height } = box.rect;
      const inside = pointer.x >= left && pointer.x <= left + width && pointer.y >= top && pointer.y <= top + height;
      // 面積相同時取後面的：走訪是由外往內，後出現的就是內層元件
      if (inside && (best === null || area(box) <= area(boxes[best]))) best = index;
    });
    return best;
  }, [pointer, boxes]);

  // 不等使用者開啟疊層就開始記，否則打開的當下每個元件都是 0 次
  useEffect(() => {
    installCommitTracker();
  }, []);

  useEffect(() => {
    // 關閉時整個疊層不會被畫出來，舊的框留著沒關係，重新打開時第一次掃描就會覆蓋
    if (!isDebugMode) return;

    const measure = () => {
      setBoxes(collectComponentBoxes({ includeFramework }));
      setDomBoxes(showDomLabels ? collectDomBoxes() : []);
      setMeasuredAt(Date.now());
    };
    measure();

    // 版面會因為捲動、縮放、資料載入而改變，用輪詢比掛一堆 observer 單純
    const timer = window.setInterval(measure, REFRESH_INTERVAL_MS);
    window.addEventListener('scroll', measure, true);
    window.addEventListener('resize', measure);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('scroll', measure, true);
      window.removeEventListener('resize', measure);
    };
  }, [isDebugMode, includeFramework, showDomLabels]);

  useEffect(() => {
    if (!isDebugMode) return;

    // 疊層本身 pointer-events: none，所以直接從 document 讀游標位置，
    // 這樣底下的頁面還是可以正常點擊
    const handleMouseMove = (e: MouseEvent) => setPointer({ x: e.clientX, y: e.clientY });

    // Alt+click 釘選，避免跟頁面原本的點擊行為打架
    const handleClick = (e: MouseEvent) => {
      if (!e.altKey) return;
      e.preventDefault();
      e.stopPropagation();
      setPinnedIndex((prev) => (prev === null ? (hoveredIndex ?? null) : null));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || !e.shiftKey) return;
      if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIncludeFramework((prev) => !prev);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick, true);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick, true);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDebugMode, hoveredIndex]);

  if (!isDebugMode) return null;

  // 標籤上的游標優先，因為那是明確指定；其次才是頁面上的位置推測
  const activeIndex = pinnedIndex ?? hoveredLabelIndex ?? hoveredIndex;
  const active = activeIndex === null ? null : (boxes[activeIndex] ?? null);
  const serverCount = boxes.filter((box) => box.kind === 'server').length;

  return (
    // 屬性放在最外層，疊層畫出來的框線與面板才會一起被 collectDomBoxes 排除
    <div data-debug-overlay="" style={{ position: 'fixed', inset: 0, zIndex: 99999, pointerEvents: 'none' }}>
      {/* 每個 DOM 節點都描一條線，等同於手動加 * { box-shadow: ... } */}
      {showDomOutlines && (
        <style>{`body *:not([data-debug-overlay], [data-debug-overlay] *) { box-shadow: inset 0 0 0 1px rgba(255,255,255,0.14) !important; }`}</style>
      )}
      {/* 原生標籤畫在元件框底下：元件是主角，DOM 是背景資訊 */}
      {domBoxes.map((box, index) => (
        <div
          key={`dom-${index}`}
          style={{
            position: 'absolute',
            top: box.rect.top,
            left: box.rect.left,
            width: box.rect.width,
            height: box.rect.height,
            boxShadow: `inset 0 0 0 1px ${DOM_COLOR}`,
            opacity: 0.5,
          }}
        >
          {box.rect.width >= LABEL_MIN_WIDTH && box.rect.height >= LABEL_MIN_HEIGHT && (
            <span
              style={{
                position: 'absolute',
                top: box.rect.top < LABEL_HEIGHT * (box.labelIndex + 1) ? LABEL_HEIGHT * box.labelIndex : -LABEL_HEIGHT * (box.labelIndex + 1),
                right: 0,
                background: DOM_COLOR,
                color: '#000',
                padding: '0 4px',
                fontSize: '10px',
                lineHeight: `${LABEL_HEIGHT}px`,
                fontFamily: 'monospace',
                whiteSpace: 'nowrap',
                borderRadius: '2px 2px 0 0',
              }}
            >
              {box.name}
            </span>
          )}
        </div>
      ))}

      {showOutlines &&
        boxes.map((box, index) => {
          // 剛 render 過的元件改用醒目色，一眼就知道這次是誰重畫了
          const justRendered = box.renderedAt > 0 && measuredAt - box.renderedAt < FLASH_MS;
          const color = justRendered ? RENDER_COLOR : COLORS[box.kind];
          const isActive = index === activeIndex;
          const showLabel = box.rect.width >= LABEL_MIN_WIDTH && box.rect.height >= LABEL_MIN_HEIGHT;

          return (
            <div
              key={`${box.name}-${index}`}
              style={{
                position: 'absolute',
                top: box.rect.top,
                left: box.rect.left,
                width: box.rect.width,
                height: box.rect.height,
                // box-shadow 不佔空間，畫在獨立圖層上完全不影響原本排版
                boxShadow: isActive || justRendered ? `inset 0 0 0 2px ${color}` : `inset 0 0 0 1px ${color}`,
                background: isActive ? 'rgba(255,255,255,0.06)' : undefined,
              }}
            >
              {showLabel && (
                <span
                  onMouseEnter={() => setHoveredLabelIndex(index)}
                  onMouseLeave={() => setHoveredLabelIndex((prev) => (prev === index ? null : prev))}
                  onClick={() => setPinnedIndex((prev) => (prev === index ? null : index))}
                  style={{
                    // 疊層本身不吃滑鼠事件，只有標籤例外，才能點得到重疊在一起的元件
                    pointerEvents: 'auto',
                    cursor: 'pointer',
                    position: 'absolute',
                    // 貼齊畫面上緣的元件，標籤放在框內才不會被裁掉
                    top: box.rect.top < LABEL_HEIGHT * (box.labelIndex + 1) ? LABEL_HEIGHT * box.labelIndex : -LABEL_HEIGHT * (box.labelIndex + 1),
                    left: 0,
                    background: color,
                    color: '#000',
                    padding: '0 4px',
                    fontSize: '10px',
                    lineHeight: `${LABEL_HEIGHT}px`,
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    borderRadius: '2px 2px 0 0',
                    opacity: isActive ? 1 : 0.75,
                  }}
                >
                  {box.name}
                  {box.renderCount > 1 && ` ×${box.renderCount}`}
                </span>
              )}
            </div>
          );
        })}

      <DebugPanel
        active={active}
        pinned={pinnedIndex !== null}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((prev) => !prev)}
        showOutlines={showOutlines}
        onToggleOutlines={() => setShowOutlines((prev) => !prev)}
        serverCount={serverCount}
        clientCount={boxes.length - serverCount}
        includeFramework={includeFramework}
        onToggleFramework={() => setIncludeFramework((prev) => !prev)}
        showDomOutlines={showDomOutlines}
        onToggleDomOutlines={() => setShowDomOutlines((prev) => !prev)}
        trackerActive={isCommitTrackerActive()}
        showDomLabels={showDomLabels}
        onToggleDomLabels={() => setShowDomLabels((prev) => !prev)}
        domCount={domBoxes.length}
      />
    </div>
  );
}
