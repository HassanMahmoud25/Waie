import { Skeleton } from "@/components/ui/skeleton";
import { EpisodeListItemSkeleton } from "@/components/content/loading-skeletons";

export default function SeriesDetailLoading() {
  return (
    <main>
      <Skeleton className="aspect-[4/5] w-full rounded-none sm:aspect-[16/7]" />
      <section className="container py-12 md:py-16">
        <Skeleton className="h-7 w-40" />
        <div className="mt-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <EpisodeListItemSkeleton key={index} />
          ))}
        </div>
      </section>
    </main>
  );
}
