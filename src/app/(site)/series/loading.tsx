import { INTRO_LONG, PageHeaderSkeleton, SeriesCardSkeleton } from "@/components/content/loading-skeletons";

/** Mirrors /series: page header, then the 2-column grid of series tiles. */
export default function SeriesLoading() {
  return (
    <main className="container py-12 md:py-16">
      <PageHeaderSkeleton eyebrowWidth="w-28" titleBar="w-40 md:w-64" intro={INTRO_LONG} />
      <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <SeriesCardSkeleton key={index} />
        ))}
      </div>
    </main>
  );
}
