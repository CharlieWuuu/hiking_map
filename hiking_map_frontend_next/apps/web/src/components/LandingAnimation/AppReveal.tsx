'use client';

import { useEffect, useState } from 'react';

import { LANDING_ANIMATION_DURATION_MS } from './LandingAnimation.const';

// 動畫播完前，把其餘畫面（Nav、頁面內容）藏起來，避免動畫播放中就先看到底下內容或版面跳動
export default function AppReveal({ children }: { children: React.ReactNode }) {
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsRevealed(true), LANDING_ANIMATION_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  // 寬螢幕時是 Nav 與 main 並排的 flex 容器，Nav 佔的寬度由它自己決定
  return <div className={`flex min-h-dvh flex-col lg:flex-row ${isRevealed ? '' : 'invisible'}`}>{children}</div>;
}
