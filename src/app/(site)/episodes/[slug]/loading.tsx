import { Skeleton } from "@/components/ui/skeleton";
import {
  BreadcrumbsSkeleton,
  EpisodeCardSkeleton,
  EpisodeNotesSkeleton,
  EyebrowPillSkeleton,
  HorizontalEpisodeCardSkeleton,
  MetaRowSkeleton,
  PrevNextTileSkeleton,
  RecommendationCardSkeleton,
  SkeletonText,
} from "@/components/content/loading-skeletons";
import { cn } from "@/lib/utils/cn";

/** The h2 under each eyebrow pill on this page. */
const headingClassName = "mt-3 text-xl leading-[1.8] md:text-2xl";

/**
 * Mirrors /episodes/[slug]: the header block (pulled up under the floating
 * header like the real one), the player, then notes, prev/next, the knowledge
 * tabs and related episodes.
 */
export default function EpisodeLoading() {
  return (
    <main>
      <section className="relative -mt-[80px] overflow-hidden pt-[6.75rem] sm:-mt-[84px] md:pt-[8.25rem]">
        <div className="container">
          <BreadcrumbsSkeleton crumbs={["w-10", "w-14", "w-24", "w-72"]} />

          <div className="mt-7 grid gap-8 lg:grid-cols-[1.25fr_.75fr]">
            <div>
              <SkeletonText className="eyebrow" lines={["w-40"]} />
              <SkeletonText
                className={cn(headingClassName, "max-w-7xl")}
                lines={["w-full sm:w-4/5", { bar: "w-1/2", line: "sm:hidden" }]}
                barHeight="h-[.55em]"
              />
              <MetaRowSkeleton className="mt-5" />
              {/* HostAvatars (36px, overlapping by 38%) beside the host names. */}
              <div className="mt-5 flex items-center gap-3">
                <div className="flex items-center">
                  {[0, 1, 2].map((index) => (
                    <Skeleton
                      key={index}
                      className={cn("size-9 rounded-full ring-2 ring-[var(--canvas)]", index > 0 && "-ms-[14px]")}
                    />
                  ))}
                </div>
                <SkeletonText className="text-sm" lines={["w-52"]} />
              </div>
            </div>
            {/* Bookmark and share (44px icon buttons) beside the "finished?" button. */}
            <div className="flex flex-wrap items-end gap-2 lg:justify-end">
              <Skeleton className="size-11 rounded-full" />
              <Skeleton className="size-11 rounded-full" />
              <Skeleton className="h-[46px] w-[123px] rounded-[14px]" />
            </div>
          </div>

          {/* EpisodeMedia: the Watch/Listen switch, then the 16:9 player. */}
          <div className="my-10">
            <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <Skeleton className="h-[57px] w-[259px] rounded-full" />
            </div>
            <Skeleton className="aspect-video w-full rounded-[var(--radius-banner)]" />
          </div>
        </div>
      </section>

      <section className="container pt-10 md:pt-12">
        <EpisodeNotesSkeleton />
      </section>

      <section className="container section">
        <EyebrowPillSkeleton width="w-28" />
        <SkeletonText className={headingClassName} lines={["w-56"]} barHeight="h-[.55em]" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <PrevNextTileSkeleton />
          <PrevNextTileSkeleton />
        </div>
      </section>

      <section className="pb-14 md:pb-20">
        <div className="container">
          <EyebrowPillSkeleton width="w-32" />
          <SkeletonText className={headingClassName} lines={["w-64"]} barHeight="h-[.55em]" />
          <div className="mt-4">
            {/* Tabs: the pill-shaped tab list, then the recommendations panel's card grid. */}
            <Skeleton className="h-[59px] w-[360px] max-w-full rounded-full" />
            <div className="grid gap-5 pt-8 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <RecommendationCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container">
          <EyebrowPillSkeleton width="w-24" />
          <SkeletonText className={headingClassName} lines={["w-72 max-w-full"]} barHeight="h-[.55em]" />
          {/* RelatedEpisodes: one prominent card beside two stacked horizontal ones. */}
          <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1.1fr_.9fr]">
            <EpisodeCardSkeleton wideFromLg />
            <div className="flex flex-col">
              {[0, 1].map((index) => (
                <div className="border-b border-[var(--line-soft)] py-5 first:pt-0 last:border-0 last:pb-0" key={index}>
                  <HorizontalEpisodeCardSkeleton />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
