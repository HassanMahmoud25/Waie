"use client";

import { useEffect, useMemo, useState } from "react";
import type { Episode } from "@/types/episode";
import type { Series } from "@/types/series";
import type { ContinueWatchingItem } from "@/lib/library/continue-watching";
import { CONTINUE_WATCHING_LIMIT } from "@/lib/library/constants";
import { getEpisodesByIdsAction } from "@/lib/library/actions";
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
 * this browser's localStorage -- see hooks/use-library.ts). Once hydrated,
 * the (typically tiny) set of in-progress episode ids is resolved via
 * getEpisodesByIdsAction -- a targeted `IN (...)` lookup -- instead of the
 * caller handing this hook the entire episode catalog to search through.
 * `isHydrated` gates it so the first client render (before localStorage has
 * been read) doesn't briefly show an empty rail where a real one belongs.
 */
export function useContinueWatching(series: Series[], initialItems: ContinueWatchingItem[]): ContinueWatchingItem[] {
  const { isHydrated, isAuthenticated, progress } = useLibrary();
  const [resolvedEpisodes, setResolvedEpisodes] = useState<Map<string, Episode>>(new Map());

  const candidateIds = useMemo(() => {
    if (isAuthenticated || !isHydrated) return [];
    return Object.entries(progress)
      .filter(([, entry]) => !entry.completed && entry.seconds > 0)
      .map(([episodeId]) => episodeId);
  }, [isAuthenticated, isHydrated, progress]);
  const candidateIdsKey = candidateIds.join(",");

  useEffect(() => {
    if (candidateIds.length === 0) {
      setResolvedEpisodes(new Map());
      return;
    }
    let cancelled = false;
    getEpisodesByIdsAction(candidateIds).then((episodes) => {
      if (!cancelled) setResolvedEpisodes(new Map(episodes.map((episode) => [episode.id, episode])));
    });
    return () => {
      cancelled = true;
    };
    // candidateIdsKey is the real dependency -- candidateIds is a fresh array each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateIdsKey]);

  return useMemo(() => {
    if (isAuthenticated) return initialItems;
    if (!isHydrated) return [];

    const seriesById = new Map(series.map((s) => [s.id, s]));

    return Object.entries(progress)
      .reverse() // insertion order is preserved for string keys -- last touched first
      .flatMap(([episodeId, entry]) => {
        if (entry.completed || entry.seconds <= 0) return [];
        const episode = resolvedEpisodes.get(episodeId);
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
  }, [isAuthenticated, isHydrated, progress, series, initialItems, resolvedEpisodes]);
}
