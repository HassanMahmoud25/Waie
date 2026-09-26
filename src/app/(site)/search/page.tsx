import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import { contentRepository } from "@/lib/repositories";
import { DEFAULT_PAGE_SIZE, paginateByCursor } from "@/lib/pagination";
import { SearchBar } from "@/components/search/search-bar";
import { SearchResultRow } from "@/components/search/search-result-row";
import { EmptyState } from "@/components/content/empty-state";
import { EpisodeGridLoader } from "@/components/content/episode-grid-loader";
import { TopicChip } from "@/components/topic/topic-chip";
import { RESULT_FORMS, pluralNoun } from "@/lib/utils/format";
import { loadMoreSearchEpisodesAction } from "./actions";

export const metadata: Metadata = { title: "البحث" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  // The full-text match/rank pass (contentRepository.search()) always runs
  // over every published episode/series/topic first -- only the first batch
  // of the already-ranked episodes is ever rendered/sent to the client (see
  // loadMoreSearchEpisodesAction for how further batches are loaded).
  const [results, series, topics] = await Promise.all([
    contentRepository.search(query),
    contentRepository.listSeries(),
    contentRepository.listTopics(),
  ]);
  const firstBatch = paginateByCursor(results.episodes, null, (episode) => episode.id, DEFAULT_PAGE_SIZE);

  const totalResults = results.episodes.length + results.series.length + results.topics.length;
  const hasSeriesOrTopicResults = results.series.length > 0 || results.topics.length > 0;

  return (
    <main className="container py-12 md:py-16">
      <p className="eyebrow-pill w-fit">البحث</p>
      <h1 className="mt-4 text-3xl font-black leading-[1.2] tracking-[-.03em] md:text-5xl">ابحث في وعي</h1>
      <p className="mt-4 max-w-xl text-lg leading-8 text-[var(--ink-soft)]">
        ابحث باسم صحابي أو نبي، أو بموضوع مثل الصلاة والتوبة والأخلاق، أو بعنوان حلقة.
      </p>
      <SearchBar defaultValue={query} />

      {query ? (
        <section className="mt-12">
          <p className="text-sm font-bold text-[var(--ink-soft)]">
            <span className="font-black text-[var(--ink)]">{totalResults}</span> {pluralNoun(totalResults, RESULT_FORMS)} لعبارة «
            <span className="text-[var(--accent-strong)]">{query}</span>»
          </p>

          {totalResults === 0 && (
            <div className="mt-6">
              <EmptyState
                icon={SearchX}
                title="لم نجد نتائج مطابقة"
                description="جرّب كلمة أبسط أو تصفّح المواضيع أدناه."
              />
            </div>
          )}

          {hasSeriesOrTopicResults && (
            <div className="mt-10 flex flex-col gap-6">
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

          {hasSeriesOrTopicResults && results.episodes.length > 0 && (
            <hr className="section-divider" />
          )}

          {firstBatch.items.length > 0 && (
            <div className={hasSeriesOrTopicResults ? "flex flex-col gap-6" : "mt-10 flex flex-col gap-6"}>
              <p className="eyebrow w-fit">الحلقات</p>
              <EpisodeGridLoader
                key={query}
                initialEpisodes={firstBatch.items}
                initialCursor={firstBatch.nextCursor}
                fetchMore={loadMoreSearchEpisodesAction.bind(null, query)}
                series={series}
              />
            </div>
          )}

          {totalResults === 0 && topics.length > 0 && (
            <div className="mt-10 flex flex-col gap-4">
              <p className="eyebrow w-fit">أو ابدأ من موضوع</p>
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
          <h2 className="mt-2 text-xl font-black">اختر موضوعًا</h2>
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
