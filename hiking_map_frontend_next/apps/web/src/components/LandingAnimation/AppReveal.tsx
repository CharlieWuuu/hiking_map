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

  return <div className={isRevealed ? '' : 'invisible'}>{children}</div>;
}
