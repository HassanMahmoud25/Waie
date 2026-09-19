import { BannerSkeleton, INTRO_SHORT, PageHeaderSkeleton } from "@/components/content/loading-skeletons";

/** Mirrors /collections: page header, then the 2-column grid of collection banners. */
export default function CollectionsLoading() {
  return (
    <main className="container py-12 md:py-16">
      <PageHeaderSkeleton eyebrowWidth="w-28" titleBar="w-36 md:w-56" intro={INTRO_SHORT} />
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <BannerSkeleton key={index} withDescription />
        ))}
      </div>
    </main>
  );
}
