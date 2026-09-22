interface TimerBarProps {
  /** Fraction of time remaining, 0..1. */
  readonly fraction: number;
}

/**
 * Round timer bar. Drains left-to-right and shifts to a warm warning colour as
 * time runs low. (Phase 1 inline version; the plan's shared `packages/ui`
 * TimerBar can replace this once the workspace package exists.)
 */
export function TimerBar({ fraction }: TimerBarProps): JSX.Element {
  const pct = Math.min(1, Math.max(0, fraction)) * 100;
  const low = fraction <= 0.3;
  return (
    <div
      className="h-2.5 w-full overflow-hidden rounded-full bg-black/30"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
    >
      <div
        className="h-full rounded-full transition-[width] duration-100 ease-linear"
        style={{
          width: `${pct}%`,
          background: low
            ? "linear-gradient(90deg, #ff6a3d, #f5d442)"
            : "linear-gradient(90deg, #6ed75a, #f5d442)",
        }}
      />
    </div>
  );
}
