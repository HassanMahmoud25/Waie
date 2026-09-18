"use client";

import { useMemo } from "react";
import { Bookmark, CheckCircle2 } from "lucide-react";
import type { Episode } from "@/types/episode";
import type { SeriesWithStats } from "@/types/series";
import { useLibrary } from "@/hooks/use-library";
import { EpisodeCard } from "@/components/episode/episode-card";
import { HorizontalEpisodeCard } from "@/components/episode/horizontal-episode-card";
import { EmptyState } from "@/components/content/empty-state";
import { EpisodeCardGridSkeleton } from "@/components/content/loading-skeletons";
import { SectionHeading } from "@/components/content/section-heading";

/** Reads saved/completed episode ids from the local library (see hooks/use-library.ts) and resolves them against server-fetched content. */
export function LibraryContent({ episodes, series }: { episodes: Episode[]; series: SeriesWithStats[] }) {
  const { isHydrated, savedEpisodeIds, progress } = useLibrary();

  const seriesById = useMemo(() => new Map(series.map((s) => [s.id, s])), [series]);
  const episodesById = useMemo(() => new Map(episodes.map((episode) => [episode.id, episode])), [episodes]);

  const savedEpisodes = savedEpisodeIds
    .map((id) => episodesById.get(id))
    .filter((episode): episode is Episode => Boolean(episode));

  const completedEpisodes = Object.entries(progress)
    .filter(([, value]) => value.completed)
    .map(([id]) => episodesById.get(id))
    .filter((episode): episode is Episode => Boolean(episode));

  if (!isHydrated) {
    return (
      <section className="mt-10">
        <EpisodeCardGridSkeleton />
      </section>
    );
  }

  return (
    <>
      <section className="mt-10">
        <SectionHeading eyebrow="مساحتك الخاصة" title="الحلقات المحفوظة" />
        {savedEpisodes.length > 0 ? (
          <>
            <div className="flex flex-col sm:hidden">
              {savedEpisodes.map((episode) => (
                <div className="border-b border-[var(--line-soft)] py-3 last:border-0" key={episode.id}>
                  <HorizontalEpisodeCard episode={episode} series={seriesById.get(episode.seriesId) ?? null} />
                </div>
              ))}
            </div>
            <div className="hidden gap-8 sm:grid sm:grid-cols-2 lg:grid-cols-3">
              {savedEpisodes.map((episode) => (
                <EpisodeCard episode={episode} series={seriesById.get(episode.seriesId) ?? null} key={episode.id} />
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            icon={Bookmark}
            title="لم تحفظ أي حلقات بعد."
            description="اضغط أيقونة الحفظ في أي حلقة لتجدها هنا."
          />
        )}
      </section>

      <section className="mt-14">
        <SectionHeading eyebrow="أرشيفك" title="حلقات أنهيت مشاهدتها" />
        {completedEpisodes.length > 0 ? (
          <>
            <div className="flex flex-col sm:hidden">
              {completedEpisodes.map((episode) => (
                <div className="border-b border-[var(--line-soft)] py-3 last:border-0" key={episode.id}>
                  <HorizontalEpisodeCard episode={episode} series={seriesById.get(episode.seriesId) ?? null} />
                </div>
              ))}
            </div>
            <div className="hidden gap-8 sm:grid sm:grid-cols-2 lg:grid-cols-3">
              {completedEpisodes.map((episode) => (
                <EpisodeCard episode={episode} series={seriesById.get(episode.seriesId) ?? null} key={episode.id} />
              ))}
            </div>
          </>
        ) : (
          <EmptyState icon={CheckCircle2} title="لم تُنهِ مشاهدة أي حلقة بعد." />
        )}
      </section>
    </>
  );
}
