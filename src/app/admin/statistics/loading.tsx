import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AdminHeaderSkeleton,
  AdminPanelHeadSkeleton,
  AdminStatSkeleton,
  SkeletonLine,
  SkeletonLines,
  lineBands,
  type LineCounts,
} from "@/components/admin/admin-skeletons";
import { cn } from "@/lib/utils/cn";

/** `.admin-section-heading`: 34px icon chip + title, 1rem below. */
function SectionHeadingSkeleton() {
  return (
    <div className="mb-4 flex items-center gap-[0.6rem]">
      <Skeleton className="size-[34px] rounded-[11px]" />
      <Skeleton className="h-5 w-24" />
    </div>
  );
}

/**
 * Picks a one- or two-line height class per width band (see LineCounts) from
 * literal class tables, so the fixed Arabic labels below that wrap at some
 * widths reserve the right height.
 */
type HeightTable = readonly [Record<1 | 2, string>, Record<1 | 2, string>, Record<1 | 2, string>, Record<1 | 2, string>];
function bandHeights(lines: LineCounts, table: HeightTable) {
  const bands = lineBands(lines) as [1 | 2, 1 | 2, 1 | 2, 1 | 2];
  return cn(...bands.map((count, band) => (band === 0 || count !== bands[band - 1] ? table[band][count] : false)));
}
const MINI_LABEL: HeightTable = [
  { 1: "h-[18px]", 2: "h-[42px]" },
  { 1: "sm:h-[18px]", 2: "sm:h-[42px]" },
  { 1: "lg:h-[18px]", 2: "lg:h-[42px]" },
  { 1: "xl:h-[18px]", 2: "xl:h-[42px]" },
];
const BAR_ROW: HeightTable = [
  { 1: "h-[19px]", 2: "h-[38px]" },
  { 1: "sm:h-[19px]", 2: "sm:h-[38px]" },
  { 1: "lg:h-[19px]", 2: "lg:h-[38px]" },
  { 1: "xl:h-[19px]", 2: "xl:h-[38px]" },
];

/** The six-tile KPI grid both sections open with; the Users labels wrap on phones and in the six-column row from `xl`. */
function KpiGridSkeleton({ labelLines = 1 }: { labelLines?: LineCounts }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <AdminStatSkeleton key={index} labelLines={labelLines} />
      ))}
    </div>
  );
}

/**
 * `.admin-mini-stat`: big number line, then its label (`label` lines per
 * width band). With a `note` (the small sub-line some minis add) the label
 * is a block line and the note follows it.
 */
type MiniStat = { label?: LineCounts; note?: LineCounts };
function MiniStatSkeleton({ label = 1, note }: MiniStat) {
  return (
    <div className="admin-mini-stat">
      <SkeletonLine box="h-[26px]" bar="h-5 w-10" />
      {note ? (
        <>
          <SkeletonLine box="h-[17px]" bar="h-2.5 w-20 max-w-full" />
          <div className="mt-1">
            <SkeletonLines lines={note} box="h-4" bar="h-2 max-w-24" />
          </div>
        </>
      ) : (
        <div className={cn("mt-[5px] pt-1", bandHeights(label, MINI_LABEL))}>
          <Skeleton className="h-2.5 w-20 max-w-full" />
        </div>
      )}
    </div>
  );
}

function MiniStatGridSkeleton({ items, className = "grid-cols-2" }: { items: MiniStat[]; className?: string }) {
  return (
    <div className={cn("grid gap-2", className)}>
      {items.map((item, index) => (
        <MiniStatSkeleton key={index} {...item} />
      ))}
    </div>
  );
}

/** StatBarList: label | track | value rows; `tall` marks rows whose (fixed) label wraps to two lines, per width band. */
function BarListSkeleton({ rows, tall = {} }: { rows: number; tall?: Record<number, LineCounts> }) {
  return (
    <div className="admin-bar-list">
      {Array.from({ length: rows }).map((_, index) => (
        <div className={cn("admin-bar-row", bandHeights(tall[index] ?? 1, BAR_ROW))} key={index}>
          <SkeletonLine box="h-[19px]" bar="h-3 w-3/4" />
          <Skeleton className="h-2.5 rounded-full" />
          <Skeleton className="h-3 w-5" />
        </div>
      ))}
    </div>
  );
}

const plain = (count: number): MiniStat[] => Array.from({ length: count }, () => ({}));

/** MiniChart: the SVG keeps a fixed 600:160 aspect ratio, then its axis-label strip. */
function ChartSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[600/160] w-full rounded-xl" />
      <div className="mt-[0.4rem] h-[1.1rem]" />
    </div>
  );
}

/** One labelled column inside a two-column statistics panel body. */
function ColumnSkeleton({ children }: { children: ReactNode }) {
  return (
    <div>
      <SkeletonLine box="mb-3 h-5" bar="h-3 w-36" />
      {children}
    </div>
  );
}

function PanelSkeleton({
  titleWidth,
  className,
  head,
  children,
}: {
  titleWidth: string;
  className?: string;
  head?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={cn("admin-panel", className)}>
      {head ?? <AdminPanelHeadSkeleton titleWidth={titleWidth} />}
      {children}
    </div>
  );
}

const TWO_COLUMNS = "grid gap-6 p-4 sm:p-5 lg:grid-cols-2";

/**
 * Mirrors app/admin/statistics/page.tsx section by section: the tinted Users
 * block (heading, six KPIs, new-users mini stats, growth charts with their
 * range tabs, in-app activity, content usage) and then the Content block
 * (heading, six KPIs, duration/series, publishing, participants,
 * completeness). Bar-list row counts follow the real limits (12 for the
 * long distributions).
 */
export default function AdminStatisticsLoading() {
  return (
    <div>
      <AdminHeaderSkeleton withBack description={[3, 2, 2]} />

      <div className="mt-8 md:mt-10">
        <section className="admin-users-section">
          <SectionHeadingSkeleton />
          <KpiGridSkeleton labelLines={[2, 1, 2]} />

          <PanelSkeleton titleWidth="w-28" className="mt-6">
            <div className="p-4 sm:p-5">
              <MiniStatGridSkeleton items={plain(5)} className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" />
            </div>
          </PanelSkeleton>

          <PanelSkeleton
            titleWidth="w-28"
            className="mt-6"
            head={
              <div className="admin-panel__head flex-wrap gap-y-3">
                <SkeletonLine box="h-[25px]" bar="h-4 w-28" />
                <div className="admin-tabs">
                  {["w-16", "w-18", "w-18", "w-14", "w-22"].map((width, index) => (
                    <Skeleton key={index} className={cn("h-10 rounded-full", width)} />
                  ))}
                </div>
              </div>
            }
          >
            <div className={TWO_COLUMNS}>
              <ColumnSkeleton>
                <ChartSkeleton />
              </ColumnSkeleton>
              <ColumnSkeleton>
                <ChartSkeleton />
              </ColumnSkeleton>
            </div>
          </PanelSkeleton>

          <PanelSkeleton titleWidth="w-36" className="mt-6">
            <div className={TWO_COLUMNS}>
              <ColumnSkeleton>
                <MiniStatGridSkeleton
                  items={[
                    { label: [2, 1, 2, 1] },
                    { label: [2, 1, 2, 1] },
                    { label: [2, 1, 2, 1] },
                    { label: [2, 1, 2, 1] },
                    { label: [2, 1, 1, 1] },
                    { label: [2, 1, 1, 1] },
                  ]}
                />
              </ColumnSkeleton>
              <ColumnSkeleton>
                <BarListSkeleton rows={6} tall={{ 0: [2, 1, 1], 2: 2 }} />
                <div className="mt-3">
                  <SkeletonLines lines={[2, 1, 2, 2]} box="h-4" bar="h-2.5" />
                </div>
              </ColumnSkeleton>
            </div>
          </PanelSkeleton>

          <PanelSkeleton titleWidth="w-32" className="mt-6">
            <div className={TWO_COLUMNS}>
              <ColumnSkeleton>
                <BarListSkeleton rows={5} />
              </ColumnSkeleton>
              <ColumnSkeleton>
                <BarListSkeleton rows={5} />
              </ColumnSkeleton>
            </div>
          </PanelSkeleton>
        </section>

        <div className="mt-8 sm:mt-10">
          <SectionHeadingSkeleton />
          <KpiGridSkeleton />

          <PanelSkeleton titleWidth="w-48" className="mt-6 sm:mt-8">
            <div className={TWO_COLUMNS}>
              <ColumnSkeleton>
                <MiniStatGridSkeleton items={[{}, { note: [2, 1, 2, 1] }, { note: 1 }, { note: 1 }]} />
              </ColumnSkeleton>
              <ColumnSkeleton>
                <BarListSkeleton rows={7} />
              </ColumnSkeleton>
            </div>
          </PanelSkeleton>

          <PanelSkeleton titleWidth="w-12" className="mt-6 sm:mt-8">
            <div className="p-4 sm:p-5">
              <BarListSkeleton rows={12} />
            </div>
          </PanelSkeleton>

          <PanelSkeleton titleWidth="w-20" className="mt-6 sm:mt-8">
            <div className={TWO_COLUMNS}>
              <ColumnSkeleton>
                <BarListSkeleton rows={4} />
              </ColumnSkeleton>
              <ColumnSkeleton>
                <MiniStatGridSkeleton items={[{ label: [2, 1, 2, 1] }, { label: [2, 1, 2, 1] }, {}]} />
              </ColumnSkeleton>
            </div>
          </PanelSkeleton>

          <PanelSkeleton titleWidth="w-28" className="mt-6 sm:mt-8">
            <div className="p-4 sm:p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div className="admin-panel p-4" key={index}>
                    <div className="flex items-center justify-between gap-3">
                      <SkeletonLine box="h-5" bar="h-3 w-24" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <Skeleton className="mt-3 h-1.5 w-full rounded-full" />
                    <SkeletonLine box="mt-3 h-4" bar="h-2.5 w-32" />
                  </div>
                ))}
              </div>
            </div>
          </PanelSkeleton>
        </div>
      </div>
    </div>
  );
}
