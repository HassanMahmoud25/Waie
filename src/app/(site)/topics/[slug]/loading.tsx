import {
  BreadcrumbsSkeleton,
  EpisodeCardGridSkeleton,
  EyebrowPillSkeleton,
  SkeletonText,
} from "@/components/content/loading-skeletons";

/** Mirrors /topics/[slug]: breadcrumbs, eyebrow + title, description, then the episode grid. */
export default function TopicDetailLoading() {
  return (
    <main className="container py-14">
      <BreadcrumbsSkeleton crumbs={["w-14", "w-16", "w-28"]} />
      <div className="mt-6">
        <EyebrowPillSkeleton width="w-16" />
        <SkeletonText
          className="mt-2 text-3xl leading-[1.2] md:text-4xl"
          lines={["w-48 md:w-60"]}
          barHeight="h-[.6em]"
        />
      </div>
      <SkeletonText
        className="mt-6 max-w-xl text-lg leading-8"
        lines={["w-full sm:w-4/5", { bar: "w-1/2", line: "sm:hidden" }]}
      />
      <section className="mt-14">
        <SkeletonText className="text-2xl md:text-3xl" lines={["w-52"]} barHeight="h-[.6em]" />
        <div className="mt-7">
          <EpisodeCardGridSkeleton />
        </div>
      </section>
    </main>
  );
}
