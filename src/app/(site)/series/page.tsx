import type { Metadata } from "next";
import { contentRepository } from "@/lib/repositories";
import { SeriesCard } from "@/components/series/series-card";
import { EmptyState } from "@/components/content/empty-state";

export const metadata: Metadata = {
  title: "السلاسل",
  description: "حلقات وعي مجمّعة حسب الموضوع، من سِيَر الصحابة وقصص الأنبياء إلى الأخلاق ومواسم العبادات.",
};

export default async function SeriesPage() {
  const series = await contentRepository.listSeries();
  // One thumbnail per series (at most one row per series id) -- never the
  // full episode table just to find each series' own cover art.
  const seriesCoverThumbnails = await contentRepository.getSeriesCoverThumbnails(series.map((s) => s.id));

  return (
    <main className="container py-12 md:py-16">
      <p className="eyebrow-pill w-fit">حسب الموضوع</p>
      <h1 className="mt-4 text-3xl font-black leading-[1.2] tracking-[-.03em] md:text-5xl">كل السلاسل</h1>
      <p className="mt-4 max-w-xl text-lg leading-8 text-[var(--ink-soft)]">
        حلقات وعي مجمّعة في سلاسل، من سِيَر الصحابة وقصص الأنبياء إلى الأخلاق ومواسم العبادات. اختر سلسلة وابدأ من أول حلقة.
      </p>

      {series.length > 0 ? (
        <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-2">
          {series.map((s, index) => {
            const coverImageUrl = s.coverImage ?? seriesCoverThumbnails[s.id];
            if (!coverImageUrl) return null;
            return <SeriesCard series={s} coverImageUrl={coverImageUrl} index={index} key={s.id} />;
          })}
        </div>
      ) : (
        <div className="mt-10">
          <EmptyState title="لا توجد سلاسل بعد" description="ستظهر السلاسل هنا عند نشرها." />
        </div>
      )}
    </main>
  );
}
