'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const DebugContext = createContext<{ isDebugMode: boolean; setDebugMode: (value: boolean) => void }>({
  isDebugMode: false,
  setDebugMode: () => {},
});

/** 使用者正在打字時不要吃掉按鍵 */
function isTyping(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

export function DebugProvider({ children }: { children: React.ReactNode }) {
  const [isDebugMode, setDebugMode] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // 按住 shift 時 e.key 是大寫的 'D'，所以要正規化後再比對
      if (!e.shiftKey || e.key.toLowerCase() !== 'd' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTyping(e.target)) return;
      e.preventDefault();
      setDebugMode((prev) => !prev);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return <DebugContext.Provider value={{ isDebugMode, setDebugMode }}>{children}</DebugContext.Provider>;
}

export function useDebugMode() {
  return useContext(DebugContext);
}
