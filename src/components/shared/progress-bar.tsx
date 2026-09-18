export function ProgressBar({
  percent,
  className = "mt-2 h-1 max-w-40",
  tone = "default",
}: {
  percent: number;
  className?: string;
  /** "current" gives the same glowing gold gradient as the homepage's continue-watching tiles, for the one episode a series page highlights as "watching now". */
  tone?: "default" | "current";
}) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div
      className={`overflow-hidden rounded-full bg-[var(--surface)] ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={tone === "current" ? "h-full journey-progress-fill--current" : "h-full bg-[var(--accent)]"}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
