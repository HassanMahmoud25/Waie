import { Skeleton } from "@/components/ui/skeleton";
import {
  AdminHeaderSkeleton,
  AdminListSkeleton,
  AdminPanelHeadSkeleton,
  AdminStatSkeleton,
  SkeletonLine,
} from "@/components/admin/admin-skeletons";

/**
 * Loading state for the overview (/admin). It is also the fallback boundary
 * for any /admin/* route without its own loading.tsx, so every other route
 * (account, sync, each list and each editor) has one -- otherwise this
 * stat-grid/quick-add/recent-episodes preview would flash in front of a page
 * that looks nothing like it.
 */
export default function AdminOverviewLoading() {
  return (
    <div>
      <AdminHeaderSkeleton />

      <div className="mt-8 md:mt-10">
        {/* Section stat tiles: episodes/series/topics (app/admin/page.tsx) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <AdminStatSkeleton key={index} withLink />
          ))}
        </div>

        {/* Quick-add card -- its height comes from stacked content (no fixed
            aspect box needed), same as the real .admin-quickadd. */}
        <div className="admin-quickadd mt-6 sm:mt-8">
          <div className="max-w-xl">
            <Skeleton tone="on-dark" className="h-[34px] w-28 rounded-full" />
            <SkeletonLine tone="on-dark" box="mt-4 h-[30px] sm:h-9" bar="h-6 w-56 max-w-full sm:h-7" />
            <SkeletonLine tone="on-dark" box="mt-2 h-14 sm:h-7" bar="h-4 w-full max-w-md" />
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Skeleton tone="on-dark" className="h-[50px] shrink-0 rounded-[14px] sm:flex-1" />
            <Skeleton tone="on-dark" className="h-[46px] shrink-0 rounded-[14px] sm:h-[50px] sm:w-[150px]" />
          </div>
        </div>

        {/* Recent episodes panel */}
        <div className="admin-panel mt-6 sm:mt-8">
          <AdminPanelHeadSkeleton titleWidth="w-24">
            <SkeletonLine box="h-5" bar="h-3 w-20" />
          </AdminPanelHeadSkeleton>
          <AdminListSkeleton count={5} thumbnail statusBadge wrap={false} />
        </div>
      </div>
    </div>
  );
}
