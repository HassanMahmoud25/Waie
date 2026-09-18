"use client";

import { useMemo } from "react";
import type { Episode } from "@/types/episode";
import type { SeriesWithStats } from "@/types/series";
import { useLibrary } from "@/hooks/use-library";
import { ContentRail } from "@/components/content/content-rail";
import { Reveal } from "@/components/shared/reveal";
import { ContinueWatchingCard } from "./continue-watching-card";

const MAX_ITEMS = 10;

/**
 * "أكمل من حيث توقفت" — the homepage's Netflix-style continue-watching rail.
 * Reads real, per-device watch progress from useLibrary (see hooks/use-library.ts,
 * shaped after the app's own WatchProgress model) and shows only episodes the
 * user actually started (progress.seconds > 0) and hasn't finished
 * (!progress.completed). No progress is ever fabricated here: until a real
 * session has that local data, this section renders nothing.
 *
 * Client-only by necessity (progress lives in localStorage, not on the
 * server), so it renders nothing until hydrated to avoid a server/client
 * markup mismatch — the same pattern SeriesEpisodeList and LibraryContent use.
 */
export function ContinueWatchingSection({
  episodes,
  series,
}: {
  episodes: Episode[];
  series: SeriesWithStats[];
}) {
  const { isHydrated, progress } = useLibrary();

  const items = useMemo(() => {
    if (!isHydrated) return [];

    const episodesById = new Map(episodes.map((episode) => [episode.id, episode]));
    const seriesById = new Map(series.map((s) => [s.id, s]));

    return Object.entries(progress)
      .reverse() // insertion order is preserved for string keys -- last touched first
      .flatMap(([episodeId, entry]) => {
        if (entry.completed || entry.seconds <= 0) return [];
        const episode = episodesById.get(episodeId);
        if (!episode || episode.durationSeconds <= 0) return [];
        if (entry.seconds >= episode.durationSeconds) return [];

        return [
          {
            episode,
            series: seriesById.get(episode.seriesId) ?? null,
            percent: (entry.seconds / episode.durationSeconds) * 100,
            remainingSeconds: episode.durationSeconds - entry.seconds,
          },
        ];
      })
      .slice(0, MAX_ITEMS);
  }, [isHydrated, progress, episodes, series]);

  if (items.length === 0) return null;

  return (
    <section className="section">
      <div className="container">
        <Reveal>
          <span className="home-eyebrow">مساحتك الخاصة</span>
          <h2 className="mt-3 text-xl font-black leading-[1.25] tracking-[-.02em] sm:text-2xl">
            أكمل من حيث توقفت
          </h2>

          <ContentRail className="rail--wide mt-8">
            {items.map(({ episode, series: episodeSeries, percent, remainingSeconds }) => (
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
        </Reveal>
      </div>
    </section>
  );
}
