"use client";

import { useMemo } from "react";
import type { Episode } from "@/types/episode";
import type { Series } from "@/types/series";
import type { ContinueWatchingItem } from "@/lib/library/continue-watching";
import { CONTINUE_WATCHING_LIMIT } from "@/lib/library/constants";
import { useLibrary } from "@/hooks/use-library";

/**
 * Resolves the "أكمل من حيث توقفت" rail for both Home and the Library page,
 * so neither maintains its own copy of this logic.
 *
 * Authenticated: `initialItems` is already the real answer -- computed
 * server-side by lib/library/continue-watching.ts's bounded, ordered,
 * capped query -- so it's returned as-is, with no client-side re-filtering
 * and no wait for hydration (same reasoning as SavedEpisodesProvider/
 * FollowedSeriesProvider: the server already knows the true state).
 *
 * Anonymous: continue-watching has no server truth (progress lives only in
 * this browser's localStorage -- see hooks/use-library.ts), so it's derived
 * here from the same `progress` map every other anonymous-path UI reads,
 * exactly as before this hook existed. `isHydrated` gates it so the first
 * client render (before localStorage has been read) doesn't briefly show an
 * empty rail where a real one belongs.
 */
export function useContinueWatching(
  episodes: Episode[],
  series: Series[],
  initialItems: ContinueWatchingItem[],
): ContinueWatchingItem[] {
  const { isHydrated, isAuthenticated, progress } = useLibrary();

  return useMemo(() => {
    if (isAuthenticated) return initialItems;
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
      .slice(0, CONTINUE_WATCHING_LIMIT);
  }, [isAuthenticated, isHydrated, progress, episodes, series, initialItems]);
}
