import { Skeleton } from "@/components/ui/skeleton";
import {
  AdminButtonSkeleton,
  AdminHeaderSkeleton,
  SkeletonLine,
  SkeletonLines,
  type LineCounts,
} from "@/components/admin/admin-skeletons";

const DESCRIPTION_LINES: LineCounts[] = [
  [3, 3, 2],
  [2, 2, 2],
  [3, 3, 2],
  [2, 3, 2],
];

/**
 * Mirrors app/admin/sync/youtube/page.tsx: header, SyncPanel's four operation
 * cards (2x2 from `sm`), then the sync-history heading and run rows. The
 * "setup incomplete" notice is left out on purpose -- it only renders when
 * the server is missing env vars, which a configured deployment never is.
 */
export default function AdminYouTubeSyncLoading() {
  return (
    <div>
      <AdminHeaderSkeleton withBack description={[2, 1, 1]} />

      <div className="mt-8 md:mt-10">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Description line counts per card (phone / tablet-desktop / wide), from the four real operation texts. */}
          {DESCRIPTION_LINES.map((lines, index) => (
            <div key={index} className="admin-panel flex flex-col gap-5 p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <Skeleton className="size-11 shrink-0 rounded-[14px]" />
                <div className="min-w-0 flex-1">
                  <SkeletonLine box="h-7" bar="h-4 w-40" />
                  <div className="mt-1">
                    <SkeletonLines lines={lines} box="h-7" bar="h-3" />
                  </div>
                </div>
              </div>
              <AdminButtonSkeleton className="mt-auto w-full sm:w-[82px]" />
            </div>
          ))}
        </div>

        <section className="mt-10 sm:mt-12">
          <SkeletonLine box="mb-4 h-7" bar="h-5 w-44" />
          <div className="admin-panel">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="admin-row flex-wrap gap-y-2">
                <div className="min-w-0 flex-1 basis-48">
                  <SkeletonLine box="h-7" bar="h-4 w-28" />
                  <SkeletonLine box="h-5" bar="h-3 w-24" />
                </div>
                <SkeletonLine box="h-5" bar="h-3 w-44" />
                <Skeleton className="h-6 w-14 rounded-full" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
