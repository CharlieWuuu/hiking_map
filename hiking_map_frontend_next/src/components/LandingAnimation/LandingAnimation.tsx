export default function LandingAnimation() {
  return (
    <div className="animate-landing-wrapper pointer-events-none fixed inset-0 z-100 bg-(--color-background)">
      {/* 圖形與 assets/logo-mark.svg 相同，座標放大 6 倍（32 → 192） */}
      <svg
        className="animate-landing-logo absolute top-1/2 left-1/2"
        width="192"
        height="192"
        viewBox="0 0 192 192"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g stroke="var(--logo-color)" fill="none" strokeWidth="16.8" strokeLinecap="round" strokeLinejoin="round">
          {/* 外框先描出來。pathLength 必須放在元素本身，放在 <g> 上不會被繼承 */}
          <rect className="animate-landing-draw" x="9" y="9" width="174" height="174" rx="51" pathLength={1} />

          {/* 起點：外框快畫完時浮現 */}
          <circle className="animate-landing-dot" cx="48" cy="144" r="18" style={{ animationDelay: '0.55s', transformOrigin: '48px 144px' }} />

          {/* 軌跡從起點延伸出去 */}
          <path
            className="animate-landing-draw"
            d="M59.4 127.8 L80.4 98.4 L105 117.6 L132 65.4"
            pathLength={1}
            style={{ animationDelay: '0.7s', animationDuration: '0.6s' }}
          />

          {/* 終點最後落下 */}
          <circle
            className="animate-landing-dot"
            cx="144"
            cy="52.8"
            r="17.4"
            fill="var(--logo-color)"
            style={{ animationDelay: '1.3s', transformOrigin: '144px 52.8px' }}
          />
        </g>
      </svg>
    </div>
  );
}
