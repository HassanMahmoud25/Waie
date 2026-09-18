import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import { contentRepository } from "@/lib/repositories";
import { SearchBar } from "@/components/search/search-bar";
import { SearchResultRow } from "@/components/search/search-result-row";
import { EpisodeCard } from "@/components/episode/episode-card";
import { EmptyState } from "@/components/content/empty-state";
import { TopicChip } from "@/components/topic/topic-chip";

export const metadata: Metadata = { title: "البحث" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const [results, series, topics] = await Promise.all([
    contentRepository.search(query),
    contentRepository.listSeries(),
    contentRepository.listTopics(),
  ]);
  const seriesById = new Map(series.map((s) => [s.id, s]));
  const totalResults = results.episodes.length + results.series.length + results.topics.length;

  return (
    <main className="container py-12 md:py-16">
      <p className="eyebrow-pill w-fit">اكتشف بوضوح</p>
      <h1 className="mt-4 text-3xl font-black leading-[1.2] tracking-[-.03em] md:text-5xl">ابحث في وعي</h1>
      <p className="mt-4 max-w-xl text-lg leading-8 text-[var(--ink-soft)]">
        عن صحابي، فكرة، سلسلة، أو موضوع — كل محتوى وعي في مكان واحد.
      </p>
      <SearchBar defaultValue={query} />

      {query ? (
        <section className="mt-12">
          <p className="text-sm font-bold text-[var(--ink-soft)]">
            <span className="font-black text-[var(--ink)]">{totalResults}</span> نتيجة لعبارة «
            <span className="text-[var(--accent-strong)]">{query}</span>»
          </p>

          {totalResults === 0 && (
            <div className="mt-6">
              <EmptyState
                icon={SearchX}
                title="لم نجد نتائج مطابقة"
                description="جرّب كلمة أبسط أو تصفّح الموضوعات أدناه."
              />
            </div>
          )}

          {(results.series.length > 0 || results.topics.length > 0) && (
            <div className="mt-8 flex flex-col gap-6">
              <p className="eyebrow w-fit">السلاسل والمواضيع</p>
              <div className="-mt-3 flex flex-col gap-3">
                {results.series.map((s) => (
                  <SearchResultRow item={s} kind="series" key={s.id} />
                ))}
                {results.topics.map((topic) => (
                  <SearchResultRow item={topic} kind="topic" key={topic.id} />
                ))}
              </div>
            </div>
          )}

          {results.episodes.length > 0 && (
            <div className="mt-10 flex flex-col gap-6">
              <p className="eyebrow w-fit">الحلقات</p>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {results.episodes.map((episode) => (
                  <EpisodeCard episode={episode} series={seriesById.get(episode.seriesId) ?? null} key={episode.id} />
                ))}
              </div>
            </div>
          )}

          {totalResults === 0 && topics.length > 0 && (
            <div className="mt-10 flex flex-col gap-4">
              <p className="eyebrow w-fit">ابدأ من هذه الموضوعات</p>
              <div className="flex flex-wrap gap-2.5">
                {topics.map((topic) => (
                  <TopicChip topic={topic} key={topic.id} />
                ))}
              </div>
            </div>
          )}
        </section>
      ) : (
        <section className="mt-14">
          <p className="eyebrow w-fit">تصفّح بالموضوع</p>
          <h2 className="mt-2 text-xl font-black">ابدأ من هذه الموضوعات</h2>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {topics.map((topic) => (
              <TopicChip topic={topic} key={topic.id} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
