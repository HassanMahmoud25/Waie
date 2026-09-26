import { INTRO_SHORT, LibraryContentSkeleton, PageHeaderSkeleton } from "@/components/content/loading-skeletons";

/** Mirrors /library: page header, then the saved / finished sections (see LibraryContent). */
export default function LibraryLoading() {
  return (
    <main className="container py-12 md:py-16">
      <PageHeaderSkeleton
        eyebrowWidth="w-32"
        titleClassName="mt-4 text-2xl leading-[1.8] md:text-3xl"
        titleBar="w-28 md:w-36"
        intro={INTRO_SHORT}
      />
      <LibraryContentSkeleton />
    </main>
  );
}
