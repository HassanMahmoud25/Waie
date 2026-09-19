import {
  BreadcrumbsSkeleton,
  EpisodeCardGridSkeleton,
  EyebrowPillSkeleton,
  SkeletonText,
} from "@/components/content/loading-skeletons";

/** Mirrors /collections/[slug]: breadcrumbs and title block, then the episode grid (which has its own wider row gap). */
export default function CollectionDetailLoading() {
  return (
    <main>
      <section className="container pt-6 md:pt-10">
        <BreadcrumbsSkeleton crumbs={["w-14", "w-16", "w-32"]} />
        <EyebrowPillSkeleton width="w-28" className="mt-6" />
        <SkeletonText
          className="mt-4 text-3xl leading-[1.2] md:text-5xl"
          lines={["w-56 md:w-96"]}
          barHeight="h-[.6em]"
        />
        <SkeletonText className="mt-4 max-w-xl text-lg leading-8" lines={["w-full", "w-3/5"]} />
      </section>

      <section className="container mt-10 pb-16 md:pb-20">
        <EpisodeCardGridSkeleton className="gap-x-6 gap-y-12" />
      </section>
    </main>
  );
}
