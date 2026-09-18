import { Skeleton } from "@/components/ui/skeleton";
import { EpisodeListItemSkeleton } from "@/components/content/loading-skeletons";

export default function SeriesLoading() {
  return (
    <main className="container py-14">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-9 w-64" />
      <Skeleton className="mt-4 h-4 w-96 max-w-full" />
      <div className="mt-10">
        {Array.from({ length: 4 }).map((_, index) => (
          <EpisodeListItemSkeleton key={index} />
        ))}
      </div>
    </main>
  );
}
