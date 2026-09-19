import { Skeleton } from "@/components/ui/skeleton";
import { INTRO_SHORT, PageHeaderSkeleton } from "@/components/content/loading-skeletons";
import { SearchLoadingBody } from "@/components/search/search-loading-body";

/** Mirrors /search: page header and search bar, then (see SearchLoadingBody) the topic chips or the results. */
export default function SearchLoading() {
  return (
    <main className="container py-12 md:py-16">
      <PageHeaderSkeleton eyebrowWidth="w-20" titleBar="w-40 md:w-64" intro={INTRO_SHORT} />
      {/* SearchBar: a glass pill, 66px tall from `sm` up (8px padding), 61px on phones (6px). */}
      <Skeleton className="mt-8 h-[61px] w-full max-w-2xl rounded-full sm:h-[66px]" />
      <SearchLoadingBody />
    </main>
  );
}
