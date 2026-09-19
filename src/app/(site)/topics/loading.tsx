import {
  EyebrowPillSkeleton,
  INTRO_LONG,
  SkeletonText,
} from "@/components/content/loading-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors /topics: the page header with its chapter index, then the first chapter (header, lead tile, topic tiles). */
export default function TopicsLoading() {
  return (
    <main>
      <div className="container pb-2 pt-12 md:pt-16">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-9 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)] lg:items-center lg:gap-16">
          <div>
            <EyebrowPillSkeleton width="w-28" />
            <SkeletonText className="mt-4 text-3xl leading-[1.2] md:text-5xl" lines={["w-64 md:w-96"]} barHeight="h-[.6em]" />
            <SkeletonText className="mt-4 max-w-xl text-lg leading-8" lines={INTRO_LONG} />
            <Skeleton className="mt-8 h-[62px] w-full max-w-[24rem] rounded-[18px]" />
          </div>
          <div className="lg:hidden">
            <div className="-mx-[14px] flex gap-2 overflow-hidden px-[14px] py-1.5">
              {["w-36", "w-44", "w-36", "w-32"].map((width, index) => (
                <Skeleton key={index} className={`h-[42px] shrink-0 rounded-full ${width}`} />
              ))}
            </div>
          </div>
          <Skeleton className="hidden h-[26rem] rounded-[var(--radius-banner)] lg:block" />
        </div>
      </div>

      <div className="section mt-4 sm:mt-6">
        <div className="container">
          <div className="mb-7 flex items-end gap-4 sm:mb-9 sm:gap-6">
            <Skeleton className="h-14 w-14 shrink-0 rounded-2xl sm:h-[4.5rem] sm:w-[4.5rem]" />
            <div className="min-w-0 flex-1">
              <SkeletonText className="eyebrow" lines={["w-20"]} />
              <SkeletonText className="mt-1.5 text-[1.4rem] leading-[1.25] sm:text-3xl" lines={["w-48"]} barHeight="h-[.6em]" />
              <SkeletonText className="mt-2 text-[.95rem] leading-[1.85]" lines={["w-full max-w-md"]} />
            </div>
          </div>

          <div className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <Skeleton className="aspect-[5/4] rounded-[var(--radius-banner)] sm:aspect-[16/8] lg:aspect-auto lg:min-h-[26rem]" />
            <div className="grid content-start gap-3 sm:grid-cols-2 sm:gap-4 lg:auto-rows-fr">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-[86px] rounded-[var(--radius-card)] sm:h-[10.5rem]" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
