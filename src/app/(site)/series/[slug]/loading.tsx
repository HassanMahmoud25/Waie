import { Skeleton } from "@/components/ui/skeleton";
import { EpisodeListItemSkeleton, EyebrowPillSkeleton, SkeletonText } from "@/components/content/loading-skeletons";

/**
 * Mirrors /series/[slug]: a full-viewport hero pulled up under the header with
 * its copy anchored to the bottom, then the journey (title + progress card, a
 * start pin, the episode rows, an end pin).
 */
export default function SeriesDetailLoading() {
  return (
    <main>
      <section className="relative -mt-[80px] overflow-hidden sm:-mt-[84px]">
        <Skeleton className="h-[100svh] w-full rounded-none" />
        <div className="container absolute inset-x-0 bottom-0 pb-(--mobile-nav-clearance) lg:pb-14">
          {/* Breadcrumb pill beside the eyebrow pill; they stack on phones. */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Skeleton className="h-[38px] w-56 rounded-full" tone="strong" />
            <EyebrowPillSkeleton width="w-24" tone="strong" />
          </div>
          <SkeletonText
            className="mt-4 max-w-2xl text-2xl leading-[1.2] sm:text-3xl md:text-5xl"
            lines={["w-2/3"]}
            barHeight="h-[.6em]"
            tone="strong"
          />
          <SkeletonText
            className="mt-4 max-w-2xl text-base leading-8 md:text-lg"
            lines={["w-full", "w-3/5"]}
            tone="strong"
          />
          <Skeleton className="mt-6 h-[38px] w-[313px] max-w-full rounded-full" tone="strong" />
        </div>
      </section>

      <section className="container section">
        <div className="journey-header">
          <SkeletonText className="text-2xl md:text-3xl" lines={["w-48"]} barHeight="h-[.6em]" />
          {/* SeriesJourneyProgress: 94px tall, or 127px once its row stacks on phones. */}
          <Skeleton className="journey-progress h-[127px] sm:h-[94px]" />
        </div>

        <div className="journey-pin journey-pin--start">
          <Skeleton className="size-[2.1rem] shrink-0 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div>
          {Array.from({ length: 5 }).map((_, index) => (
            <EpisodeListItemSkeleton key={index} />
          ))}
        </div>
        <div className="journey-pin journey-pin--end">
          <Skeleton className="size-[2.1rem] shrink-0 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </section>
    </main>
  );
}
