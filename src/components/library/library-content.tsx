"use client";

import { useEffect, useMemo, useState } from "react";
import { Bookmark, CheckCircle2, Rss } from "lucide-react";
import type { Episode } from "@/types/episode";
import type { SeriesWithStats } from "@/types/series";
import type { ContinueWatchingItem } from "@/lib/library/continue-watching";
import { useLibrary } from "@/hooks/use-library";
import { useContinueWatching } from "@/hooks/use-continue-watching";
import { useFollowedSeriesContext } from "@/components/library/followed-series-provider";
import { getEpisodesByIdsAction, getSeriesCoverThumbnailsAction } from "@/lib/library/actions";
import { EpisodeCard } from "@/components/episode/episode-card";
import { SeriesCard } from "@/components/series/series-card";
import { ContinueWatchingCard } from "@/components/home/continue-watching-card";
import { ContentRail } from "@/components/content/content-rail";
import { EmptyState } from "@/components/content/empty-state";
import { LibraryContentSkeleton } from "@/components/content/loading-skeletons";
import { SectionHeading } from "@/components/content/section-heading";

/**
 * Reads saved/completed episode ids (hooks/use-library.ts) and followed
 * series ids (FollowedSeriesProvider) -- typically a handful of ids, not the
 * whole catalog -- and resolves each by id via getEpisodesByIdsAction /
 * getSeriesCoverThumbnailsAction, so this page never fetches every episode
 * just to find the visitor's own saved/completed/followed ones.
 */
export function LibraryContent({
  series,
  continueWatching,
}: {
  series: SeriesWithStats[];
  /** Server-computed via lib/library/continue-watching.ts; empty for anonymous visitors. */
  continueWatching: ContinueWatchingItem[];
}) {
  const { isHydrated, savedEpisodeIds, progress } = useLibrary();
  const { followedSeriesIds } = useFollowedSeriesContext();
  const continueWatchingItems = useContinueWatching(series, continueWatching);

  const seriesById = useMemo(() => new Map(series.map((s) => [s.id, s])), [series]);

  const completedIds = useMemo(
    () => Object.entries(progress).filter(([, value]) => value.completed).map(([id]) => id),
    [progress],
  );
  const neededEpisodeIds = useMemo(() => [...new Set([...savedEpisodeIds, ...completedIds])], [savedEpisodeIds, completedIds]);
  const neededEpisodeIdsKey = neededEpisodeIds.join(",");

  // Grows only -- a toggled save/completion adds at most one id to fetch and
  // never re-fetches (or drops) ids already resolved, so saving/unsaving an
  // episode stays instant instead of re-showing the page skeleton.
  const [episodesById, setEpisodesById] = useState<Map<string, Episode>>(new Map());
  const [hasLoadedEpisodesOnce, setHasLoadedEpisodesOnce] = useState(false);

  useEffect(() => {
    const missingIds = neededEpisodeIds.filter((id) => !episodesById.has(id));
    if (missingIds.length === 0) {
      setHasLoadedEpisodesOnce(true);
      return;
    }
    let cancelled = false;
    getEpisodesByIdsAction(missingIds).then((episodes) => {
      if (cancelled) return;
      setEpisodesById((prev) => {
        const next = new Map(prev);
        for (const episode of episodes) next.set(episode.id, episode);
        return next;
      });
      setHasLoadedEpisodesOnce(true);
    });
    return () => {
      cancelled = true;
    };
    // neededEpisodeIdsKey is the real dependency -- neededEpisodeIds is a fresh array each render, and
    // episodesById is only read to skip ids already resolved, not to react to.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [neededEpisodeIdsKey]);

  const [seriesCoverThumbnails, setSeriesCoverThumbnails] = useState<Record<string, string>>({});
  const [hasLoadedSeriesCoversOnce, setHasLoadedSeriesCoversOnce] = useState(false);
  const followedSeriesIdsKey = followedSeriesIds.join(",");

  useEffect(() => {
    if (followedSeriesIds.length === 0) {
      setHasLoadedSeriesCoversOnce(true);
      return;
    }
    let cancelled = false;
    getSeriesCoverThumbnailsAction(followedSeriesIds).then((thumbnails) => {
      if (cancelled) return;
      setSeriesCoverThumbnails((prev) => ({ ...prev, ...thumbnails }));
      setHasLoadedSeriesCoversOnce(true);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followedSeriesIdsKey]);

  const followedSeries = followedSeriesIds
    .map((id) => seriesById.get(id))
    .filter((s): s is SeriesWithStats => Boolean(s));

  const savedEpisodes = savedEpisodeIds
    .map((id) => episodesById.get(id))
    .filter((episode): episode is Episode => Boolean(episode));

  const completedEpisodes = completedIds
    .map((id) => episodesById.get(id))
    .filter((episode): episode is Episode => Boolean(episode));

  if (!isHydrated || !hasLoadedEpisodesOnce || !hasLoadedSeriesCoversOnce) return <LibraryContentSkeleton />;

  return (
    <>
      {continueWatchingItems.length > 0 && (
        <>
          <section className="mt-(--section-gap)">
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
          <hr className="section-divider" />
        </>
      )}

      <section className={continueWatchingItems.length === 0 ? "mt-(--section-gap)" : undefined}>
        <SectionHeading eyebrow="جديدها يصلك أولًا" title="السلاسل التي تتابعها" />
        {followedSeries.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-2">
            {followedSeries.map((s, index) => {
              const coverImageUrl = s.coverImage ?? seriesCoverThumbnails[s.id];
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

      <hr className="section-divider" />

      <section>
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

      <hr className="section-divider" />

      <section>
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
