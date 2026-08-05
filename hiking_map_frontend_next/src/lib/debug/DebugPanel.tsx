'use client';

import { useState } from 'react';

import { useAuth } from '../authStore';
import type { ComponentBox } from './fiber';
import { formatValue } from './formatValue';

const COLORS = {
  server: 'hsl(190 100% 55%)',
  client: 'hsl(330 100% 62%)',
} as const;

const DOM_COLOR = 'hsl(45 100% 60%)';
const RENDER_COLOR = 'hsl(85 100% 55%)';

const SECTION_MAX_HEIGHT = 180;

type Props = {
  active: ComponentBox | null;
  pinned: boolean;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  showOutlines: boolean;
  onToggleOutlines: () => void;
  showDomOutlines: boolean;
  onToggleDomOutlines: () => void;
  showDomLabels: boolean;
  onToggleDomLabels: () => void;
  domCount: number;
  trackerActive: boolean;
  includeFramework: boolean;
  onToggleFramework: () => void;
  serverCount: number;
  clientCount: number;
};

function IconButton({ label, title, active, onClick }: { label: string; title: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        border: '1px solid rgba(255,255,255,0.25)',
        background: active ? 'rgba(255,255,255,0.18)' : 'transparent',
        color: '#fff',
        borderRadius: '3px',
        fontSize: '10px',
        fontFamily: 'monospace',
        lineHeight: '16px',
        padding: '0 5px',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}

/** 每個區塊各自摺疊，內容超過上限就在區塊內部捲動，不影響其他區塊 */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);

  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          width: '100%',
          border: 0,
          background: 'transparent',
          color: 'rgba(255,255,255,0.5)',
          fontSize: '10px',
          fontFamily: 'monospace',
          letterSpacing: '0.05em',
          padding: '6px 10px',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ width: '8px' }}>{open ? '▾' : '▸'}</span>
        {title}
      </button>
      {open && <div style={{ maxHeight: SECTION_MAX_HEIGHT, overflow: 'auto', padding: '0 10px 8px' }}>{children}</div>}
    </div>
  );
}

function Code({ children }: { children: string }) {
  return <pre style={{ margin: 0, color: '#8ef', fontSize: '10px', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{children}</pre>;
}

// 以 Debug 開頭的 displayName 會被疊層過濾掉，避免 debug 工具照到自己
IconButton.displayName = 'DebugIconButton';
Section.displayName = 'DebugSection';
Code.displayName = 'DebugCode';

export default function DebugPanel({
  active,
  pinned,
  collapsed,
  onToggleCollapsed,
  showOutlines,
  onToggleOutlines,
  showDomOutlines,
  onToggleDomOutlines,
  showDomLabels,
  onToggleDomLabels,
  domCount,
  trackerActive,
  includeFramework,
  onToggleFramework,
  serverCount,
  clientCount,
}: Props) {
  // 直接訂閱 store，global state 一變動面板就跟著更新
  const auth = useAuth();
  const globalState = { isLoggedIn: auth.isLoggedIn, isLoading: auth.isLoading, userId: auth.userId, username: auth.username };

  return (
    <div
      data-debug-overlay=""
      style={{
        position: 'fixed',
        top: 8,
        right: 8,
        width: 320,
        maxHeight: collapsed ? undefined : '80vh',
        overflow: collapsed ? 'hidden' : 'auto',
        background: 'rgba(0,0,0,0.92)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '6px',
        fontFamily: 'monospace',
        color: '#fff',
        pointerEvents: 'auto',
      }}
    >
      {/* 捲動時標題列固定在最上面，才知道現在看的是哪個元件 */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 8px',
          fontSize: '11px',
          fontWeight: 700,
          background: 'rgba(0,0,0,0.96)',
          borderBottom: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {active ? (
            <>
              <span style={{ color: COLORS[active.kind] }}>■ </span>
              {active.name}
              <span style={{ opacity: 0.5, fontWeight: 400 }}> · {active.kind}</span>
              {active.renderCount > 0 && <span style={{ color: RENDER_COLOR, fontWeight: 400 }}> · render {active.renderCount} 次</span>}
              {pinned && <span style={{ opacity: 0.5, fontWeight: 400 }}> · 已釘選</span>}
            </>
          ) : (
            <span style={{ opacity: 0.5, fontWeight: 400 }}>把游標移到元件上</span>
          )}
        </div>
        <IconButton label={collapsed ? '▸' : '▾'} title={collapsed ? '展開面板' : '收合面板'} onClick={onToggleCollapsed} />
      </div>

      {!collapsed && (
        <>
          <Section title="檢視方式">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              <IconButton label="元件框" title="畫出每個 React 元件的範圍" active={showOutlines} onClick={onToggleOutlines} />
              <IconButton label="所有 DOM" title="每個 HTML 標籤都描線" active={showDomOutlines} onClick={onToggleDomOutlines} />
              <IconButton label="DOM 名稱" title="畫面內的 HTML 標籤加上名稱，例如 input[type=password]" active={showDomLabels} onClick={onToggleDomLabels} />
              <IconButton label="Next.js 內部" title="連 Next.js 與 React 自己的元件一起顯示" active={includeFramework} onClick={onToggleFramework} />
            </div>
            <div style={{ display: 'flex', gap: '10px', fontSize: '10px', marginTop: '6px' }}>
              <span style={{ color: COLORS.server }}>■ server {serverCount}</span>
              <span style={{ color: COLORS.client }}>■ client {clientCount}</span>
              {showDomLabels && <span style={{ color: DOM_COLOR }}>■ dom {domCount}</span>}
              <span style={{ color: RENDER_COLOR }}>■ 剛 render</span>
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '6px', lineHeight: 1.6 }}>
              Shift+D 關閉 · 點標籤看該元件 · Alt+點擊 釘選
              {!trackerActive && <div style={{ color: 'hsl(20 100% 65%)' }}>commit hook 沒掛上，render 次數無法計算</div>}
            </div>
          </Section>

          <Section title="GLOBAL STATE · useAuth">
            <Code>{formatValue(globalState)}</Code>
          </Section>

          {active?.owner && (
            <Section title="由誰渲染">
              <Code>{`${active.owner} 的 JSX 裡寫了這個 <${active.name}>`}</Code>
            </Section>
          )}

          {active && (
            <Section title="PROPS">
              {active.kind === 'server' ? <Code>{'server component 在瀏覽器沒有實體，\n拿不到 props'}</Code> : <Code>{formatValue(active.props)}</Code>}
            </Section>
          )}

          {active?.hookStates && (
            <Section title={`STATE · ${active.hookStates.length} 個 useState/useReducer`}>
              {active.hookStates.length === 0 ? (
                <Code>{'（這個元件沒有 state）'}</Code>
              ) : (
                <Code>{active.hookStates.map((state, index) => `${active.hookNames?.[index] ?? `[${index}]`} = ${formatValue(state)}`).join('\n')}</Code>
              )}
            </Section>
          )}

          {active?.dom && (
            <Section title="DOM">
              <Code>{`<${active.dom.tag}>${active.dom.className ? `\nclass="${active.dom.className}"` : ''}`}</Code>
            </Section>
          )}
        </>
      )}
    </div>
  );
}
