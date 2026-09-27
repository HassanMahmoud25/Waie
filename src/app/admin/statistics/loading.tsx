import { AdminHeaderSkeleton } from "@/components/admin/admin-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors app/admin/statistics/page.tsx: header, KPI grid, then four admin-panel sections. */
export default function AdminStatisticsLoading() {
  return (
    <div>
      <AdminHeaderSkeleton withBack />

      <div className="mt-8 md:mt-10">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-[22px]" />
          ))}
        </div>

        {Array.from({ length: 4 }).map((_, index) => (
          <div className="admin-panel mt-6 p-5 sm:mt-8" key={index}>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-4 h-24 w-full rounded-2xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
