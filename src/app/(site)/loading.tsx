import { Skeleton } from "@/components/ui/skeleton";
import {
  BannerSkeleton,
  EyebrowPillSkeleton,
  HomeSectionHeadSkeleton,
  RailSkeleton,
  SkeletonText,
} from "@/components/content/loading-skeletons";

/** Mirrors the homepage: SiteHero, then the series bento, the latest rail and the most-watched rail. */
export default function HomeLoading() {
  return (
    <main>
      {/* SiteHero: a full-viewport slab pulled up under the floating header, its copy anchored to the bottom. */}
      <section className="relative -mt-[80px] w-full overflow-hidden sm:-mt-[84px]">
        <Skeleton className="h-[100svh] min-h-[420px] w-full rounded-none" />
        <div className="container absolute inset-x-0 bottom-0 pb-[var(--mobile-nav-clearance)] lg:pb-20">
          <Skeleton className="h-[30px] w-28 rounded-full" tone="strong" />
          <SkeletonText
            className="mt-4 max-w-3xl text-xl leading-[1.3] sm:text-4xl sm:leading-[1.4] md:text-5xl"
            lines={["w-full", { bar: "w-2/3", line: "hidden md:block" }]}
            barHeight="h-[.6em]"
            tone="strong"
          />
          <SkeletonText className="mt-4 max-w-xl text-sm leading-7 sm:text-base" lines={["w-full", "w-2/3"]} tone="strong" />
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
            <Skeleton className="h-[46px] w-full rounded-[14px] sm:w-44" tone="strong" />
            <Skeleton className="h-[46px] w-full rounded-[14px] sm:w-44" tone="strong" />
          </div>
          {/* The stats strip only exists from `sm` up. */}
          <div className="mt-8 hidden gap-px overflow-hidden rounded-[18px] sm:flex sm:w-fit">
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} className="h-[69px] w-[106px] rounded-none" tone="strong" />
            ))}
          </div>
        </div>
      </section>

      {/* Series bento. */}
      <section className="section">
        <div className="container">
          <HomeSectionHeadSkeleton titleWidth="w-36" />

          {/* Below `md`: the feature banner stacked over its text, then a rail of compact tiles. */}
          <div className="mt-6 flex flex-col gap-5 md:hidden">
            <BannerSkeleton size="feature" />
            <div className="rail rail--wide">
              {Array.from({ length: 4 }).map((_, index) => (
                <BannerSkeleton key={index} />
              ))}
            </div>
          </div>

          {/* From `md`: the feature spans the first row, compact tiles fill the rest. */}
          <div className="series-bento mt-8 hidden md:grid">
            <BannerSkeleton size="feature" />
            <BannerSkeleton stretch />
            {Array.from({ length: 3 }).map((_, index) => (
              <BannerSkeleton key={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Latest episodes. */}
      <section className="section pt-0">
        <div className="container">
          <HomeSectionHeadSkeleton titleWidth="w-36" />
          <RailSkeleton className="mt-8" />
        </div>
      </section>

      {/* Most watched: a tinted band with no "see all" link and the wide rail. */}
      <section className="section section-tint pt-0">
        <div className="container">
          <EyebrowPillSkeleton width="w-24" />
          <SkeletonText className="mt-3 text-xl leading-[1.25] sm:text-2xl" lines={["w-40"]} barHeight="h-[.6em]" />
          <RailSkeleton wide count={6} className="mt-8" />
        </div>
      </section>
    </main>
  );
}
