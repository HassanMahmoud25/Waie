import { Skeleton } from "@/components/ui/skeleton";
import { AdminHeaderSkeleton, AdminListSkeleton } from "@/components/admin/admin-skeletons";

/**
 * Loading state for the overview (/admin) only -- every other /admin/*
 * route has its own loading.tsx now (episodes/series/collections/topics),
 * since the overview's stat grid + quick-add hero + recent-episodes panel
 * (see app/admin/page.tsx) don't look anything like a plain row list.
 */
export default function AdminOverviewLoading() {
  return (
    <div>
      <AdminHeaderSkeleton />

      <div className="mt-8 md:mt-10">
        {/* Section stat tiles */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="admin-panel admin-stat">
              <span className="flex items-center justify-between">
                <Skeleton className="size-11 rounded-[14px]" />
                <Skeleton className="h-4 w-12 rounded-full" />
              </span>
              <span>
                <Skeleton className="h-9 w-12" />
                <Skeleton className="mt-2 h-4 w-20" />
              </span>
            </div>
          ))}
        </div>

        {/* Quick-add card -- its height comes from stacked content (no fixed
            aspect box needed), same as the real .admin-quickadd. */}
        <div className="admin-quickadd mt-6 sm:mt-8">
          <div className="max-w-xl">
            <Skeleton tone="on-dark" className="h-[26px] w-32 rounded-full" />
            <Skeleton tone="on-dark" className="mt-4 h-7 w-64 max-w-full" />
            <Skeleton tone="on-dark" className="mt-3 h-4 w-full max-w-sm" />
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Skeleton tone="on-dark" className="h-12 flex-1 rounded-[14px]" />
            <Skeleton tone="on-dark" className="h-11 w-44 shrink-0 rounded-[14px]" />
          </div>
        </div>

        {/* Recent episodes panel */}
        <div className="admin-panel mt-6 sm:mt-8">
          <div className="admin-panel__head">
            <Skeleton className="h-[22px] w-28" />
            <Skeleton className="h-4 w-24" />
          </div>
          <AdminListSkeleton count={5} thumbnail statusBadge wrap={false} />
        </div>
      </div>
    </div>
  );
}
