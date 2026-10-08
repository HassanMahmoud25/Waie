import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";

/**
 * Shared building blocks for every /admin loading.tsx: each piece mirrors
 * one real, reused fragment of the admin UI (AdminShell's header,
 * Create*Form, the status tabs, an admin-panel row list, a labelled form
 * field) so a page's loading state can be composed to match that specific
 * page instead of falling back to one generic skeleton for every route. See
 * admin.css / globals.css for the dimensions these track
 * (.admin-back/.eyebrow-pill/.admin-label/.admin-field/.btn/.admin-tab/
 * .admin-row/.admin-thumb/.admin-tile/.admin-stat).
 *
 * Text placeholders reserve the real line box (e.g. a 48px h1 line, a 32px
 * `leading-8` description line) and draw a thinner bar inside it, so the
 * skeleton → content swap doesn't shift anything below the text.
 */

/** A text line: `box` is the real line box (height + spacing), `bar` the visible placeholder inside it. */
export function SkeletonLine({
  box,
  bar,
  tone,
}: {
  box: string;
  bar: string;
  tone?: "default" | "strong" | "on-dark";
}) {
  return (
    <div className={cn("flex items-center", box)}>
      <Skeleton tone={tone} className={bar} />
    </div>
  );
}

/**
 * How many lines a piece of wrapping text takes per width band. The admin
 * content column is ~340px on phones, ~720px on tablets, 684px at 1024 (the
 * desktop sidebar appears) and 940-1080px from 1280, and two-column panels
 * only split at `lg` -- so text can wrap *less* on a tablet than at 1024.
 * A plain number means every width; `[mobile, tablet, wide]` covers below
 * `sm` / `sm` to `xl` / `xl` up; `[mobile, sm, lg, xl]` splits the middle
 * band at `lg`.
 */
export type LineCounts =
  | number
  | readonly [mobile: number, tablet: number, wide: number]
  | readonly [mobile: number, sm: number, lg: number, xl: number];

/** Normalizes LineCounts to one count per band: [below sm, sm, lg, xl]. */
export function lineBands(lines: LineCounts): [number, number, number, number] {
  if (typeof lines === "number") return [lines, lines, lines, lines];
  if (lines.length === 3) return [lines[0], lines[1], lines[1], lines[2]];
  return [lines[0], lines[1], lines[2], lines[3]];
}

/**
 * A paragraph of SkeletonLines that shows `lines` lines per width band, so
 * text that wraps differently on a phone and on a wide desktop still reserves
 * the right height at each. The last line's bar is shorter, like the end of a
 * paragraph.
 */
export function SkeletonLines({ lines, box, bar }: { lines: LineCounts; box: string; bar: string }) {
  const bands = lineBands(lines);
  const total = Math.max(...bands);
  return Array.from({ length: total }).map((_, index) => {
    const shown = bands.map((count) => index < count);
    return (
      <div
        key={index}
        className={cn(
          "items-center",
          box,
          shown[0] ? "flex" : "hidden",
          shown[1] !== shown[0] && (shown[1] ? "sm:flex" : "sm:hidden"),
          shown[2] !== shown[1] && (shown[2] ? "lg:flex" : "lg:hidden"),
          shown[3] !== shown[2] && (shown[3] ? "xl:flex" : "xl:hidden"),
        )}
      >
        <Skeleton className={cn(bar, index === total - 1 && total > 1 ? "w-2/3" : "w-full")} />
      </div>
    );
  });
}

/**
 * Mirrors AdminShell's header: optional back link, eyebrow pill, title,
 * description. `compactTitle` matches AdminShell's smaller heading for titles
 * over 36 characters (most episode titles). The description is reserved as
 * `leading-8` lines, `description` of them per width band.
 */
export function AdminHeaderSkeleton({
  withBack = false,
  compactTitle = false,
  description = 1,
}: {
  withBack?: boolean;
  compactTitle?: boolean;
  description?: LineCounts;
}) {
  return (
    <header>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {withBack && <Skeleton className="h-8 w-20 rounded-full" />}
        <Skeleton className="h-[34px] w-24 rounded-full" />
      </div>
      {compactTitle ? (
        // A typical (~50-character) episode title fits one line from `md` up but wraps to two on phones/tablets.
        <div className="mt-4">
          <SkeletonLine box="h-8 md:h-[2.4rem]" bar="h-6 w-full max-w-lg md:h-7" />
          <SkeletonLine box="h-8 md:hidden" bar="h-6 w-2/3" />
        </div>
      ) : (
        <SkeletonLine box="mt-4 h-[2.4rem] md:h-12" bar="h-7 w-48 md:h-8" />
      )}
      <div className="mt-3 max-w-xl">
        <SkeletonLines lines={description} box="h-8" bar="h-4 max-w-md" />
      </div>
    </header>
  );
}

/**
 * Mirrors one labelled admin form field: `.admin-label` line, then
 * `.admin-field` (8px below it), then an optional `leading-7` hint. Inputs
 * and selects are 50px; pass `fieldHeight` for a textarea / multi-select.
 * `hint` is the hint's line count per width band; hints are
 * `text-sm leading-7` in the editors -- pass `hintLine="h-5"` for a plain
 * `text-sm` hint (the change-password form).
 */
export function AdminFieldSkeleton({
  labelWidth = "w-24",
  fieldHeight = "h-[50px]",
  fieldWidth,
  hint = 0,
  hintLine = "h-7",
}: {
  labelWidth?: string;
  fieldHeight?: string;
  fieldWidth?: string;
  hint?: LineCounts;
  hintLine?: string;
}) {
  return (
    <div>
      <SkeletonLine box="h-[21px]" bar={cn("h-3.5", labelWidth)} />
      <Skeleton className={cn("mt-2 w-full rounded-[14px]", fieldHeight, fieldWidth)} />
      {hint !== 0 && (
        <div className="mt-2">
          <SkeletonLines lines={hint} box={hintLine} bar="h-3" />
        </div>
      )}
    </div>
  );
}

/** A `.btn` (46px tall); pass the width the real label gives it. */
export function AdminButtonSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn("h-[46px] shrink-0 rounded-[14px]", className)} />;
}

/**
 * Mirrors the dashed Create*Form panel shared by episodes/series/topics/
 * people. `fields={2}` is the people form's name + image-URL pair, which sits
 * in a two-column grid from `sm` up. The button stretches full-width below
 * `sm` like the real one does in the column layout.
 */
export function AdminCreateFormSkeleton({ fields = 1, buttonWidth = "sm:w-32" }: { fields?: 1 | 2; buttonWidth?: string }) {
  return (
    <div className="admin-panel admin-panel--dashed flex flex-col gap-3 p-5 sm:flex-row sm:items-start">
      <div className={cn("flex-1", fields > 1 && "grid gap-3 sm:grid-cols-2")}>
        {Array.from({ length: fields }).map((_, index) => (
          <AdminFieldSkeleton key={index} labelWidth={index === 0 ? "w-28" : "w-32"} />
        ))}
      </div>
      <AdminButtonSkeleton className={cn("w-full sm:mt-[1.85rem]", buttonWidth)} />
    </div>
  );
}

/** Mirrors EpisodeSearchInput's single field (episodes list only). Caller supplies spacing. */
export function AdminSearchFieldSkeleton() {
  return <Skeleton className="h-[50px] w-full rounded-[14px]" />;
}

/** Mirrors the status-filter tabs (episodes/series; topics/people have none). Caller supplies spacing. */
export function AdminTabsSkeleton({
  className,
  widths = ["w-22", "w-26", "w-24", "w-22"],
}: {
  className?: string;
  widths?: string[];
}) {
  return (
    <div className={cn("admin-tabs", className)}>
      {widths.map((width, index) => (
        <Skeleton key={index} className={cn("h-10 rounded-full", width)} />
      ))}
    </div>
  );
}

/** Mirrors `.admin-panel__head` with just a title (pass `children` for a trailing link/control). */
export function AdminPanelHeadSkeleton({ titleWidth = "w-28", children }: { titleWidth?: string; children?: ReactNode }) {
  return (
    <div className="admin-panel__head">
      <SkeletonLine box="h-[25px]" bar={cn("h-4", titleWidth)} />
      {children}
    </div>
  );
}

/**
 * Mirrors one admin-row. The icon-tile rows (series/topics/people) keep the
 * plain flex row with the action's own mobile/desktop split (a circular icon
 * button below `sm`, icon+label from `sm` up). The thumbnail rows (episodes)
 * instead mirror AdminMediaRow's `.admin-media-row` grid by reusing its real
 * class names -- `.admin-thumb` goes full-width and the action moves to its
 * own bordered full-width line below 640px, exactly as the loaded row does.
 */
function AdminRowSkeleton({ thumbnail, statusBadge }: { thumbnail: boolean; statusBadge: boolean }) {
  if (thumbnail) {
    return (
      <div className="admin-row admin-media-row">
        <div className="admin-thumb">
          <Skeleton className="size-full rounded-none" />
        </div>
        <div className="admin-media-row__body">
          {statusBadge && (
            <div className="admin-media-row__badges">
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          )}
          {/* A typical (~50-character) title takes two lines in the stacked phone card. */}
          <div>
            <SkeletonLines lines={[2, 1, 1]} box="h-6" bar="h-4 max-w-[75%]" />
          </div>
          <SkeletonLine box="h-5" bar="h-3 w-1/2" />
        </div>
        <div className="admin-media-row__action">
          <AdminButtonSkeleton className="w-[101px] max-sm:w-full" />
        </div>
      </div>
    );
  }
  return (
    <div className="admin-row">
      <Skeleton className="size-11 shrink-0 rounded-[14px]" />
      <div className="min-w-0 flex-1">
        {statusBadge && <Skeleton className="h-6 w-16 rounded-full" />}
        <SkeletonLine box="mt-[0.4rem] h-6" bar="h-4 w-3/4" />
        <SkeletonLine box="mt-1 h-5" bar="h-3 w-1/2" />
      </div>
      <Skeleton className="size-11 shrink-0 rounded-full sm:hidden" />
      <AdminButtonSkeleton className="hidden w-[101px] sm:block" />
    </div>
  );
}

/**
 * Mirrors the admin-panel list of rows itself (episodes/series/topics/
 * people). `wrap={false}` skips the outer `.admin-panel` div for callers that
 * already provide one themselves -- the overview's recent-episodes section
 * has its own `.admin-panel` wrapping a `.admin-panel__head` plus the rows,
 * so nesting another panel inside it here would double the surface/border.
 */
export function AdminListSkeleton({
  count,
  thumbnail = true,
  statusBadge = true,
  wrap = true,
}: {
  count: number;
  thumbnail?: boolean;
  statusBadge?: boolean;
  wrap?: boolean;
}) {
  const rows = Array.from({ length: count }).map((_, index) => (
    <AdminRowSkeleton key={index} thumbnail={thumbnail} statusBadge={statusBadge} />
  ));
  return wrap ? <div className="admin-panel">{rows}</div> : rows;
}

/**
 * Mirrors an `.admin-stat` card: icon tile (48px inside a stat card), then
 * the big value (its clamp() font size, line-height 1) and the label.
 * `withLink` adds the overview's trailing "إدارة ←" link beside the tile;
 * `labelLines` covers labels that wrap in narrow columns.
 */
export function AdminStatSkeleton({ withLink = false, labelLines = 1 }: { withLink?: boolean; labelLines?: LineCounts }) {
  const tile = <Skeleton className="size-12 rounded-[15px]" />;
  return (
    <div className="admin-panel admin-stat">
      {withLink ? (
        <span className="flex items-center justify-between">
          {tile}
          <SkeletonLine box="h-5" bar="h-3 w-11" />
        </span>
      ) : (
        tile
      )}
      <span>
        <SkeletonLine box="h-[clamp(1.7rem,4.5vw,2.35rem)]" bar="h-[75%] w-12" />
        <div className="mt-1.5">
          <SkeletonLines lines={labelLines} box="h-5" bar="h-3.5 max-w-20" />
        </div>
      </span>
    </div>
  );
}

/**
 * Mirrors the editors' dashed "delete" panel (series/topics/people/episodes):
 * a bold title, one `leading-7` explanation line, and the danger button.
 * The real panel is `flex-wrap`, so the button drops onto its own line while
 * the explanation is too wide to share a row with it: below `sm` for the short
 * series/topic/person notes, below `xl` for the episode editor's long warning.
 */
export function AdminDeletePanelSkeleton({ stackedBelow = "sm", note = 1 }: { stackedBelow?: "sm" | "xl"; note?: LineCounts }) {
  return (
    <div className="admin-panel admin-panel--dashed flex flex-wrap items-center justify-between gap-4 p-5">
      <div className={cn("w-full min-w-0", stackedBelow === "sm" ? "sm:w-auto sm:flex-1" : "xl:w-auto xl:flex-1")}>
        <SkeletonLine box="h-6" bar="h-4 w-28" />
        <div className="mt-1">
          <SkeletonLines lines={note} box="h-7" bar="h-3 max-w-sm" />
        </div>
      </div>
      <AdminButtonSkeleton className="w-32" />
    </div>
  );
}

/** Mirrors the editors' publish card (series/episodes): status pill + note, then the publish toggle. */
export function AdminPublishCardSkeleton() {
  return (
    <div className="admin-panel flex flex-wrap items-center justify-between gap-4 p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-16 rounded-full" />
        <SkeletonLine box="h-5" bar="h-3 w-28" />
      </div>
      <AdminButtonSkeleton className="w-[100px]" />
    </div>
  );
}

/**
 * Mirrors the editors' read-only identity card: tile, title + meta, optional
 * trailing button. With the button, the real text column is squeezed to
 * ~70px on phones, so its title wraps to two lines and each meta item
 * (`metaItems` of them) stacks on its own ~27px line there.
 */
export function AdminIdentityCardSkeleton({ withAction = false, metaItems = 1 }: { withAction?: boolean; metaItems?: number }) {
  return (
    <div className="admin-panel flex flex-wrap items-center gap-4 p-5">
      <Skeleton className="size-11 shrink-0 rounded-[14px]" />
      <div className="min-w-0 flex-1">
        <div className="mt-[0.4rem]">
          <SkeletonLines lines={withAction ? [2, 1, 1] : 1} box="h-6" bar="h-4 max-w-40" />
        </div>
        <div className="mt-1">
          <SkeletonLines lines={withAction ? [metaItems, 1, 1] : 1} box={withAction ? "h-[1.7rem] sm:h-5" : "h-5"} bar="h-3 max-w-56" />
        </div>
      </div>
      {withAction && <AdminButtonSkeleton className="w-40" />}
    </div>
  );
}

/** Mirrors the editors' Save / رجوع footer (border-top, stacked below `sm`). */
export function AdminFormFooterSkeleton({ extraButton = false }: { extraButton?: boolean }) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-[var(--line-soft)] pt-6 sm:flex-row sm:items-center">
      <AdminButtonSkeleton className="w-full sm:w-32" />
      <AdminButtonSkeleton className="w-full sm:w-[73px]" />
      {extraButton && <AdminButtonSkeleton className="w-full sm:w-40" />}
    </div>
  );
}
