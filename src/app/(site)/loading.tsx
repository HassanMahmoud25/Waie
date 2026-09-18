import { Skeleton } from "@/components/ui/skeleton";
import { EpisodeCardGridSkeleton, RailSkeleton } from "@/components/content/loading-skeletons";

export default function HomeLoading() {
  return (
    <main>
      <Skeleton className="aspect-[3/4] w-full rounded-none sm:aspect-[16/9] md:aspect-[21/9]" />
      <section className="section">
        <div className="container">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-3 h-7 w-56" />
          <div className="mt-8">
            <RailSkeleton />
          </div>
        </div>
      </section>
      <section className="section section-tint pt-0">
        <div className="container">
          <EpisodeCardGridSkeleton count={2} />
        </div>
      </section>
    </main>
  );
}
