import type { Metadata } from "next";
import { contentRepository } from "@/lib/repositories";
import { SeriesCard } from "@/components/series/series-card";
import { EmptyState } from "@/components/content/empty-state";
import { findSeriesCoverEpisode } from "@/lib/utils/content";

export const metadata: Metadata = {
  title: "السلاسل",
  description: "كل سلاسل وعي في مكان واحد، كل سلسلة رحلة واضحة تبدأ من حيث ينبغي.",
};

export default async function SeriesPage() {
  const [series, episodes] = await Promise.all([
    contentRepository.listSeries(),
    contentRepository.listEpisodes(),
  ]);

  return (
    <main className="container py-12 md:py-16">
      <p className="eyebrow-pill w-fit">رحلات معرفية</p>
      <h1 className="mt-4 text-3xl font-black leading-[1.2] tracking-[-.03em] md:text-5xl">كل السلاسل</h1>
      <p className="mt-4 max-w-xl text-lg leading-8 text-[var(--ink-soft)]">
        بدلًا من قوائم تشغيل متفرقة، اجعل كل سلسلة رحلة واضحة تبدأ من حيث ينبغي.
      </p>

      {series.length > 0 ? (
        <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-2">
          {series.map((s, index) => {
            const coverImageUrl = s.coverImage ?? findSeriesCoverEpisode(episodes, s.id)?.thumbnailUrl;
            if (!coverImageUrl) return null;
            return <SeriesCard series={s} coverImageUrl={coverImageUrl} index={index} key={s.id} />;
          })}
        </div>
      ) : (
        <div className="mt-10">
          <EmptyState title="لا توجد سلاسل بعد" description="سيتم نشر السلاسل هنا قريبًا." />
        </div>
      )}
    </main>
  );
}
