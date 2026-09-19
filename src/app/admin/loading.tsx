import { Skeleton } from "@/components/ui/skeleton";

/**
 * Shared by every /admin route (the frame stays put; only this fills the
 * content column): a page header, then a panel of rows, matching the real
 * pages' proportions so nothing jumps when content arrives.
 */
export default function AdminLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-28 rounded-full" />
      <Skeleton className="mt-4 h-9 w-48" />
      <Skeleton className="mt-4 h-4 w-full max-w-xl" />

      <div className="mt-8 md:mt-10">
        <div className="admin-panel">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="admin-row">
              <Skeleton className="aspect-video w-[92px] shrink-0 rounded-xl sm:w-32" />
              <div className="flex-1">
                <Skeleton className="h-4 w-20 rounded-full" />
                <Skeleton className="mt-3 h-4 w-3/4" />
                <Skeleton className="mt-2 h-3 w-1/2" />
              </div>
              <Skeleton className="hidden h-11 w-24 shrink-0 rounded-[14px] sm:block" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
