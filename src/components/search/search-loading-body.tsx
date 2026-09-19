"use client";

import { useSearchParams } from "next/navigation";
import { EpisodeCardGridSkeleton, SkeletonText, TopicChipsSkeleton } from "@/components/content/loading-skeletons";

/**
 * The part of the search page's skeleton below the search bar. /search has two
 * different bodies -- the topic chips with no query, the result count and cards
 * with one -- and only the URL says which is coming, so this reads it.
 */
export function SearchLoadingBody() {
  const hasQuery = Boolean(useSearchParams().get("q")?.trim());

  if (!hasQuery) {
    return (
      <section className="mt-14">
        <SkeletonText className="eyebrow w-fit" lines={["w-24"]} />
        <SkeletonText className="mt-2 text-xl" lines={["w-36"]} barHeight="h-[.6em]" />
        <TopicChipsSkeleton className="mt-5" />
      </section>
    );
  }

  return (
    <section className="mt-12">
      <SkeletonText className="text-sm" lines={["w-56"]} barHeight="h-[.75em]" />
      <div className="mt-10 flex flex-col gap-6">
        <SkeletonText className="eyebrow w-fit" lines={["w-16"]} />
        <EpisodeCardGridSkeleton />
      </div>
    </section>
  );
}
