"use client";

import { useEffect, useMemo, useState } from "react";
import type { Episode } from "@/types/episode";
import type { Series } from "@/types/series";
import type { ContinueWatchingItem } from "@/lib/library/continue-watching";
import { CONTINUE_WATCHING_LIMIT } from "@/lib/library/constants";
import { useLibrary } from "@/hooks/use-library";
import { useEpisodesByIds } from "@/hooks/use-content-queries";

/**
 * Resolves the "أكمل من حيث توقفت" rail for both Home and the Library page,
 * so neither maintains its own copy of this logic.
 *
 * Authenticated: `initialItems` is the server's answer (lib/library/
 * continue-watching.ts's bounded, ordered, capped query) and is what the
 * server render and the first client render show -- no hydration mismatch,
 * no wait. After mount the rail follows the live, database-backed progress
 * store instead (same filter and order as the server query: started, not
 * completed, newest progress first), because the page itself may be served
 * from the client Router Cache and progress saves deliberately don't
 * revalidate pages. Episodes the server already resolved are reused; any
 * newly started one is looked up by id. It only switches after mount because
 * the progress store is module state, which on the server is shared between
 * requests.
 *
 * Anonymous: continue-watching has no server truth (progress lives only in
 * this browser's localStorage -- see hooks/use-library.ts). Once hydrated,
 * the (typically tiny) set of in-progress episode ids is resolved by id --
 * a targeted `IN (...)` lookup -- instead of the caller handing this hook the
 * entire episode catalog to search through. `isHydrated` gates it so the
 * first client render (before localStorage has been read) doesn't briefly
 * show an empty rail where a real one belongs.
 */
export function useContinueWatching(series: Series[], initialItems: ContinueWatchingItem[]): ContinueWatchingItem[] {
  const { isHydrated, isAuthenticated, progress } = useLibrary();
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const isLive = isAuthenticated ? isMounted : isHydrated;

  // In-progress entries, best candidates first.
  const candidates = useMemo(() => {
    if (!isLive) return [];
    const entries = Object.entries(progress).filter(([, entry]) => !entry.completed && entry.seconds > 0);
    return isAuthenticated
      ? entries.filter(([, entry]) => entry.durationSeconds > 0).sort(([, a], [, b]) => b.updatedAt - a.updatedAt)
      : entries.reverse(); // insertion order is preserved for string keys -- last touched first
  }, [isLive, isAuthenticated, progress]);

  const knownEpisodes = useMemo(() => new Map(initialItems.map((item) => [item.episode.id, item])), [initialItems]);
  // Headroom over the limit: an id that turns out unpublished is dropped, and the next one fills in.
  const missingIds = useMemo(
    () =>
      candidates
        .slice(0, CONTINUE_WATCHING_LIMIT * 2)
        .map(([episodeId]) => episodeId)
        .filter((episodeId) => !knownEpisodes.has(episodeId)),
    [candidates, knownEpisodes],
  );
  const { episodes: fetchedEpisodes } = useEpisodesByIds(missingIds);

  return useMemo(() => {
    if (!isLive) return isAuthenticated ? initialItems : [];

    const seriesById = new Map(series.map((s) => [s.id, s]));
    const fetchedById = new Map<string, Episode>(fetchedEpisodes.map((episode) => [episode.id, episode]));

    return candidates
      .flatMap(([episodeId, entry]) => {
        const known = knownEpisodes.get(episodeId);
        const episode = known?.episode ?? fetchedById.get(episodeId);
        if (!episode) return [];
        const episodeSeries = known?.series ?? seriesById.get(episode.seriesId) ?? null;

        if (isAuthenticated) {
          return [
            {
              episode,
              series: episodeSeries,
              percent: Math.min(100, (entry.seconds / entry.durationSeconds) * 100),
              remainingSeconds: Math.max(0, entry.durationSeconds - entry.seconds),
            },
          ];
        }

        if (episode.durationSeconds <= 0 || entry.seconds >= episode.durationSeconds) return [];
        return [
          {
            episode,
            series: episodeSeries,
            percent: (entry.seconds / episode.durationSeconds) * 100,
            remainingSeconds: episode.durationSeconds - entry.seconds,
          },
        ];
      })
      .slice(0, CONTINUE_WATCHING_LIMIT);
  }, [isLive, isAuthenticated, initialItems, series, candidates, knownEpisodes, fetchedEpisodes]);
}
