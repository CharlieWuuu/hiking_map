type Props = {
  label: string;
  value: number;
  max?: number;
};

const SIZE = 120;
const STROKE_WIDTH = 10;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function AchievementRing({ label, value, max = 100 }: Props) {
  const ratio = Math.min(value / max, 1);
  const offset = CIRCUMFERENCE * (1 - ratio);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="currentColor" className="text-background" strokeWidth={STROKE_WIDTH} />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            className="text-accent"
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-accent text-2xl font-bold">{value}</span>
          <span className="text-background-contrary/60 text-xs">／{max}</span>
        </div>
      </div>
      <span className="text-background-contrary text-sm">{label}</span>
    </div>
  );
}
