import { Skeleton } from "@/components/ui/skeleton";

/** Matches EpisodeCard's proportions so grids don't jump when real content arrives. */
export function EpisodeCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[16/9] w-full" />
      <Skeleton className="mt-4 h-3 w-24" />
      <Skeleton className="mt-3 h-5 w-4/5" />
      <Skeleton className="mt-2 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-2/3" />
    </div>
  );
}

export function EpisodeCardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <EpisodeCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function EpisodeListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 py-4 sm:gap-5">
      <Skeleton className="aspect-video w-[46%] shrink-0 sm:w-44" />
      <div className="flex-1">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="mt-2 h-4 w-1/2" />
      </div>
    </div>
  );
}

export function RailSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="rail">
      {Array.from({ length: count }).map((_, index) => (
        <EpisodeCardSkeleton key={index} />
      ))}
    </div>
  );
}
