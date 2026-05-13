import { cn } from '@/shared/lib/cn';

type Props = {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  trackClass?: string;
  progressClass?: string;
  caption?: string;
  label?: string;
};

export function ProgressRing({
  value,
  max = 100,
  size = 72,
  stroke = 8,
  trackClass = 'text-black/8',
  progressClass = 'text-primary',
  caption,
  label,
}: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, value / max));
  const offset = c * (1 - pct);

  return (
    <div className="flex flex-col gap-1">
      {label ? <span className="text-xs font-semibold text-muted">{label}</span> : null}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            strokeWidth={stroke}
            stroke="currentColor"
            fill="none"
            className={trackClass}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            strokeWidth={stroke}
            stroke="currentColor"
            fill="none"
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={cn('transition-[stroke-dashoffset] duration-500 ease-out', progressClass)}
          />
        </svg>
        {caption ? (
          <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-text">
            {caption}
          </div>
        ) : null}
      </div>
    </div>
  );
}
