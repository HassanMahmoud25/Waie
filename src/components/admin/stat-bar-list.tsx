/**
 * A compact, CSS-only horizontal bar list -- reused by the statistics page
 * for "Episodes by Series", "Episodes by Participant" and "Publishing
 * Activity" rather than pulling in a charting dependency for one simple
 * visualization. Bars grow via a plain `width: %` (no absolute positioning),
 * so the site's `dir="rtl"` handles the correct fill direction on its own,
 * exactly like ProgressBar (src/components/shared/progress-bar.tsx).
 */

export type StatBarItem = { key: string; label: string; value: number };

export function StatBarList({
  items,
  limit,
  emptyLabel = "لا توجد بيانات كافية حتى الآن.",
}: {
  items: StatBarItem[];
  /** Caps how many rows render -- a long tail collapses into one summary line instead of growing the page indefinitely. */
  limit?: number;
  emptyLabel?: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-[var(--ink-soft)]">{emptyLabel}</p>;
  }

  const visible = limit ? items.slice(0, limit) : items;
  const hiddenCount = items.length - visible.length;
  const max = Math.max(1, ...items.map((item) => item.value));

  return (
    <div className="admin-bar-list">
      {visible.map((item) => {
        const percent = Math.max(2, Math.round((item.value / max) * 100));
        return (
          <div className="admin-bar-row" key={item.key}>
            <span className="admin-bar-row__label">{item.label}</span>
            <span className="admin-bar-track">
              <span className="admin-bar-fill" style={{ width: `${percent}%` }} />
            </span>
            <span className="admin-bar-row__value">{item.value}</span>
          </div>
        );
      })}
      {hiddenCount > 0 && (
        <p className="mt-1 text-xs font-bold text-[var(--muted)]">
          و{hiddenCount} أخرى غير معروضة هنا.
        </p>
      )}
    </div>
  );
}
