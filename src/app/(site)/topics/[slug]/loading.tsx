import { Skeleton } from "@/components/ui/skeleton";
import { EpisodeCardGridSkeleton } from "@/components/content/loading-skeletons";

export default function TopicDetailLoading() {
  return (
    <main className="container py-14">
      <Skeleton className="h-4 w-48" />
      <div className="mt-6 flex items-center gap-5">
        <Skeleton className="size-16 rounded-full" />
        <div>
          <Skeleton className="h-3 w-16" />
          <Skeleton className="mt-2 h-9 w-48" />
        </div>
      </div>
      <Skeleton className="mt-6 h-4 w-full max-w-xl" />
      <section className="mt-12">
        <Skeleton className="h-7 w-40" />
        <div className="mt-7">
          <EpisodeCardGridSkeleton />
        </div>
      </section>
    </main>
  );
}
