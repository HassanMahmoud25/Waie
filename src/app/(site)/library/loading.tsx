import { Skeleton } from "@/components/ui/skeleton";
import { EpisodeCardGridSkeleton } from "@/components/content/loading-skeletons";

export default function LibraryLoading() {
  return (
    <main className="container py-14">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-9 w-40" />
      <Skeleton className="mt-4 h-4 w-full max-w-xl" />
      <div className="mt-10">
        <EpisodeCardGridSkeleton />
      </div>
    </main>
  );
}
