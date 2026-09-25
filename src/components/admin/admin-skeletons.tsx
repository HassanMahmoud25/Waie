import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";

/**
 * Shared building blocks for every /admin loading.tsx: each piece mirrors
 * one real, reused fragment of the admin UI (AdminShell's header,
 * Create*Form, the status tabs, an admin-panel row list) so a page's loading
 * state can be composed to match that specific page instead of falling back
 * to one generic skeleton for every route. See admin.css for the dimensions
 * these track (.admin-back/.eyebrow-pill/.admin-field/.btn/.admin-tab/
 * .admin-row/.admin-thumb/.admin-tile).
 */

/** Mirrors AdminShell's header: optional back chip, eyebrow pill, title, description. */
export function AdminHeaderSkeleton({ withBack = false }: { withBack?: boolean }) {
  return (
    <header>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {withBack && <Skeleton className="h-8 w-20 rounded-full" />}
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-9 w-48" />
      <Skeleton className="mt-3 h-4 w-full max-w-xl" />
    </header>
  );
}

/** Mirrors the dashed Create*Form panel shared by episodes/series/collections/topics. */
export function AdminCreateFormSkeleton() {
  return (
    <div className="admin-panel admin-panel--dashed flex flex-col gap-3 p-5 sm:flex-row sm:items-start">
      <div className="flex-1">
        <Skeleton className="h-[18px] w-40" />
        <Skeleton className="mt-2 h-12 w-full rounded-[14px]" />
      </div>
      <Skeleton className="h-11 w-32 shrink-0 rounded-[14px] sm:mt-[1.85rem]" />
    </div>
  );
}

/** Mirrors the status-filter tabs (episodes/series/collections; topics has none). */
export function AdminTabsSkeleton() {
  const widths = ["w-14", "w-20", "w-20", "w-24"];
  return (
    <div className="admin-tabs mt-6">
      {widths.map((width, index) => (
        <Skeleton key={index} className={cn("h-10 rounded-full", width)} />
      ))}
    </div>
  );
}

/**
 * Mirrors one admin-row: a thumbnail (episodes) or a colored icon tile
 * (series/collections/topics), an optional status badge, title and meta
 * lines, and the trailing edit action -- rendered as BOTH the mobile circular
 * icon button and the desktop icon+label button (matching the real button's
 * own `max-sm:` classes), since the previous skeleton hid the action
 * entirely below `sm` while the real row still shows it.
 */
function AdminRowSkeleton({ thumbnail, statusBadge }: { thumbnail: boolean; statusBadge: boolean }) {
  return (
    <div className="admin-row">
      {thumbnail ? (
        <Skeleton className="aspect-video w-[92px] shrink-0 rounded-xl sm:w-32" />
      ) : (
        <Skeleton className="size-11 shrink-0 rounded-[14px]" />
      )}
      <div className="min-w-0 flex-1">
        {statusBadge && <Skeleton className="h-4 w-20 rounded-full" />}
        <Skeleton className={cn("h-4 w-3/4", statusBadge && "mt-3")} />
        <Skeleton className="mt-2 h-3 w-1/2" />
      </div>
      <Skeleton className="size-11 shrink-0 rounded-full sm:hidden" />
      <Skeleton className="hidden h-11 w-24 shrink-0 rounded-[14px] sm:block" />
    </div>
  );
}

/**
 * Mirrors the admin-panel list of rows itself (episodes/series/collections/
 * topics). `wrap={false}` skips the outer `.admin-panel` div for callers that
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
