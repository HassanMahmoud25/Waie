import { Skeleton } from "@/components/ui/skeleton";
import { EpisodeCardGridSkeleton } from "@/components/content/loading-skeletons";

export default function SearchLoading() {
  return (
    <main className="container py-12 md:py-16">
      <Skeleton className="h-7 w-32 rounded-full" />
      <Skeleton className="mt-4 h-12 w-64 sm:h-16 sm:w-96" />
      <Skeleton className="mt-4 h-6 w-72" />
      <Skeleton className="mt-8 h-14 w-full max-w-2xl rounded-full" />
      <div className="mt-12">
        <EpisodeCardGridSkeleton />
      </div>
    </main>
  );
}
