"use client";

import { useMemo } from "react";
import { Bookmark, CheckCircle2, Rss } from "lucide-react";
import type { Episode } from "@/types/episode";
import type { SeriesWithStats } from "@/types/series";
import type { ContinueWatchingItem } from "@/lib/library/continue-watching";
import { useLibrary } from "@/hooks/use-library";
import { useContinueWatching } from "@/hooks/use-continue-watching";
import { useFollowedSeriesContext } from "@/components/library/followed-series-provider";
import { EpisodeCard } from "@/components/episode/episode-card";
import { SeriesCard } from "@/components/series/series-card";
import { ContinueWatchingCard } from "@/components/home/continue-watching-card";
import { ContentRail } from "@/components/content/content-rail";
import { EmptyState } from "@/components/content/empty-state";
import { LibraryContentSkeleton } from "@/components/content/loading-skeletons";
import { SectionHeading } from "@/components/content/section-heading";
import { findSeriesCoverEpisode } from "@/lib/utils/content";

/** Reads saved/completed episode ids from the local library (see hooks/use-library.ts) and resolves them against server-fetched content. */
export function LibraryContent({
  episodes,
  series,
  continueWatching,
}: {
  episodes: Episode[];
  series: SeriesWithStats[];
  /** Server-computed via lib/library/continue-watching.ts; empty for anonymous visitors. */
  continueWatching: ContinueWatchingItem[];
}) {
  const { isHydrated, savedEpisodeIds, progress } = useLibrary();
  const { followedSeriesIds } = useFollowedSeriesContext();
  const continueWatchingItems = useContinueWatching(episodes, series, continueWatching);

  const seriesById = useMemo(() => new Map(series.map((s) => [s.id, s])), [series]);
  const episodesById = useMemo(() => new Map(episodes.map((episode) => [episode.id, episode])), [episodes]);

  const followedSeries = followedSeriesIds
    .map((id) => seriesById.get(id))
    .filter((s): s is SeriesWithStats => Boolean(s));

  const savedEpisodes = savedEpisodeIds
    .map((id) => episodesById.get(id))
    .filter((episode): episode is Episode => Boolean(episode));

  const completedEpisodes = Object.entries(progress)
    .filter(([, value]) => value.completed)
    .map(([id]) => episodesById.get(id))
    .filter((episode): episode is Episode => Boolean(episode));

  if (!isHydrated) return <LibraryContentSkeleton />;

  return (
    <>
      {continueWatchingItems.length > 0 && (
        <section className="mt-10">
          <SectionHeading eyebrow="تابع مشاهدتك" title="كمل من حيث توقفت" />
          <ContentRail>
            {continueWatchingItems.map(({ episode, series: episodeSeries, percent, remainingSeconds }) => (
              <div className="hover-rise" key={episode.id}>
                <ContinueWatchingCard
                  episode={episode}
                  series={episodeSeries}
                  percent={percent}
                  remainingSeconds={remainingSeconds}
                />
              </div>
            ))}
          </ContentRail>
        </section>
      )}

      <section className="mt-14">
        <SectionHeading eyebrow="جديدها يصلك أولًا" title="السلاسل التي تتابعها" />
        {followedSeries.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-2">
            {followedSeries.map((s, index) => {
              const coverImageUrl = s.coverImage ?? findSeriesCoverEpisode(episodes, s.id)?.thumbnailUrl;
              if (!coverImageUrl) return null;
              return <SeriesCard series={s} coverImageUrl={coverImageUrl} index={index} key={s.id} />;
            })}
          </div>
        ) : (
          <EmptyState
            icon={Rss}
            title="لم تُتابع أي سلسلة بعد."
            description="اضغط «تابع السلسلة» في صفحة أي سلسلة لتصلك حلقاتها الجديدة هنا."
          />
        )}
      </section>

      <section className="mt-14">
        <SectionHeading eyebrow="للرجوع إليها" title="الحلقات المحفوظة" />
        {savedEpisodes.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {savedEpisodes.map((episode) => (
              <EpisodeCard episode={episode} series={seriesById.get(episode.seriesId) ?? null} key={episode.id} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Bookmark}
            title="لم تحفظ أي حلقات بعد."
            description="اضغط أيقونة الحفظ في أي حلقة لتجدها هنا."
          />
        )}
      </section>

      <section className="mt-14">
        <SectionHeading eyebrow="أرشيفك" title="حلقات أنهيتها" />
        {completedEpisodes.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {completedEpisodes.map((episode) => (
              <EpisodeCard episode={episode} series={seriesById.get(episode.seriesId) ?? null} key={episode.id} />
            ))}
          </div>
        ) : (
          <EmptyState icon={CheckCircle2} title="لم تُنهِ أي حلقة بعد." />
        )}
      </section>
    </>
  );
}
