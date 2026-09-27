/**
 * A small, dependency-free SVG chart (line or bar) for time-series data --
 * built instead of adding a charting library because the project has none,
 * and a handful of points never justifies one. Laid out horizontally with a
 * fixed internal viewBox that scales via CSS (width: 100%), so it never
 * grows the page vertically the way a stacked bar list would once a range
 * has dozens of points (see StatBarList for the categorical case that one
 * *is* right for -- series/participant distributions).
 *
 * RTL note: the chart deliberately keeps standard chronological left-to-right
 * orientation even on this RTL site -- flipping a time axis is not what "RTL
 * safe" means for a chart (that's about not overflowing the RTL layout and
 * rendering Arabic labels correctly, both of which this does), and mirroring
 * calendar time is unfamiliar even in RTL products. SVG's own coordinate
 * space is direction-agnostic, so this renders identically regardless of the
 * page's dir.
 */

export type ChartPoint = { key: string; label: string; value: number };

const VIEW_WIDTH = 600;
const PAD_X = 6;
const PAD_TOP = 12;

function pickLabelIndexes(count: number, maxLabels: number): number[] {
  if (count === 0) return [];
  if (count <= maxLabels) return Array.from({ length: count }, (_, i) => i);
  const step = (count - 1) / (maxLabels - 1);
  const indexes = new Set<number>();
  for (let i = 0; i < maxLabels; i++) indexes.add(Math.round(i * step));
  return Array.from(indexes).sort((a, b) => a - b);
}

export function MiniChart({
  points,
  variant = "line",
  height = 160,
  emptyLabel = "لا توجد بيانات كافية حتى الآن.",
}: {
  points: ChartPoint[];
  variant?: "line" | "bar";
  height?: number;
  emptyLabel?: string;
}) {
  if (points.length === 0) {
    return <p className="text-sm text-[var(--ink-soft)]">{emptyLabel}</p>;
  }

  const padBottom = 22;
  const plotWidth = VIEW_WIDTH - PAD_X * 2;
  const plotHeight = height - PAD_TOP - padBottom;
  const max = Math.max(1, ...points.map((point) => point.value));

  const stepX = points.length > 1 ? plotWidth / (points.length - 1) : 0;
  const xAt = (index: number) => PAD_X + (points.length > 1 ? index * stepX : plotWidth / 2);
  const yAt = (value: number) => PAD_TOP + plotHeight - (value / max) * plotHeight;
  const baseline = PAD_TOP + plotHeight;

  const labelIndexes = pickLabelIndexes(points.length, variant === "bar" ? 8 : 6);
  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"}${xAt(index)},${yAt(point.value)}`).join(" ");
  const areaPath = `${linePath} L${xAt(points.length - 1)},${baseline} L${xAt(0)},${baseline} Z`;

  return (
    <div className="admin-mini-chart">
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
        preserveAspectRatio="none"
        className="admin-mini-chart__svg"
        style={{ aspectRatio: `${VIEW_WIDTH} / ${height}` }}
        role="img"
        aria-label={variant === "line" ? "رسم بياني خطي" : "رسم بياني بالأعمدة"}
      >
        {variant === "bar" ? (
          points.map((point, index) => {
            const barWidth = Math.max(3, stepX > 0 ? stepX * 0.55 : plotWidth * 0.4);
            const y = yAt(point.value);
            return (
              <rect
                key={point.key}
                x={xAt(index) - barWidth / 2}
                y={y}
                width={barWidth}
                height={Math.max(0, baseline - y)}
                rx={2}
                className="admin-mini-chart__bar"
              />
            );
          })
        ) : (
          <>
            <defs>
              <linearGradient id="admin-mini-chart-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.22" />
                <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#admin-mini-chart-area)" stroke="none" />
            <path d={linePath} className="admin-mini-chart__line" fill="none" />
            {points.length <= 40 &&
              points.map((point, index) => (
                <circle key={point.key} cx={xAt(index)} cy={yAt(point.value)} r={2.6} className="admin-mini-chart__dot" />
              ))}
          </>
        )}
      </svg>
      <div className="admin-mini-chart__labels">
        {labelIndexes.map((index, position) => {
          const isFirst = position === 0;
          const isLast = position === labelIndexes.length - 1;
          return (
            <span
              key={points[index].key}
              className="admin-mini-chart__label"
              style={{
                left: `${(xAt(index) / VIEW_WIDTH) * 100}%`,
                transform: isFirst ? "translateX(0)" : isLast ? "translateX(-100%)" : "translateX(-50%)",
              }}
            >
              {points[index].label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
