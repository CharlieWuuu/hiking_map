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
        <g stroke="var(--logo-color)" fill="none" strokeWidth="16.8" strokeLinecap="round" strokeLinejoin="round" pathLength="1">
          {/* 外框先描出來 */}
          <rect x="9" y="9" width="174" height="174" rx="51" strokeDasharray="1" strokeDashoffset="1">
            <animate attributeName="stroke-dashoffset" from="1" to="0" dur="0.7s" fill="freeze" />
          </rect>

          {/* 起點 */}
          <circle cx="48" cy="144" r="18" opacity="0">
            <animate attributeName="opacity" from="0" to="1" begin="0.5s" dur="0.2s" fill="freeze" />
          </circle>

          {/* 軌跡沿著路線畫出 */}
          <path d="M59.4 127.8 L80.4 98.4 L105 117.6 L132 65.4" strokeDasharray="1" strokeDashoffset="1">
            <animate attributeName="stroke-dashoffset" from="1" to="0" begin="0.65s" dur="0.7s" fill="freeze" />
          </path>

          {/* 終點最後落下 */}
          <circle cx="144" cy="52.8" r="17.4" fill="var(--logo-color)" opacity="0">
            <animate attributeName="opacity" from="0" to="1" begin="1.3s" dur="0.2s" fill="freeze" />
          </circle>
        </g>
      </svg>
    </div>
  );
}
