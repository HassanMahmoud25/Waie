import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/server";
import { contentRepository } from "@/lib/repositories";
import { CONTINUE_WATCHING_LIMIT } from "@/lib/library/constants";
import type { Episode } from "@/types/episode";
import type { Series } from "@/types/series";

export type ContinueWatchingItem = {
  episode: Episode;
  series: Series | null;
  /** 0-100, how much of the episode has been watched. */
  percent: number;
  remainingSeconds: number;
};

/**
 * The signed-in user's "أكمل من حيث توقفت" rail -- episodes actually started
 * (seconds > 0) and not yet finished (completed === false, the same flag
 * COMPLETE_THRESHOLD already maintains everywhere else -- see
 * lib/library/actions.ts -- so this reuses the app's one definition of
 * "done" rather than re-deriving it from seconds/duration here), newest
 * progress first, capped at CONTINUE_WATCHING_LIMIT. Anonymous visitors get
 * an empty list -- their continue-watching still comes from localStorage
 * (see hooks/use-continue-watching.ts), unchanged by this function.
 *
 * Filtering, ordering and the limit all happen in the WHERE/ORDER
 * BY/TAKE of a single query -- never "fetch every WatchProgress row and
 * filter in JS". The two follow-up lookups (episodes, series) are each one
 * batched `IN (...)` query against the already-bounded id list, not one
 * query per row, so this is three queries total regardless of how many
 * episodes the user has ever watched.
 *
 * getEpisodesByIds already excludes unpublished/deleted episodes (see its
 * own comment in prisma-content-repository.ts) -- the `episode: { status:
 * "PUBLISHED" } }` filter below is the same guarantee applied at the
 * WatchProgress query itself, so a since-unpublished episode is dropped
 * before it ever reaches the id list, not filtered out after the fact.
 */
export async function getContinueWatching(): Promise<ContinueWatchingItem[]> {
  const user = await getSessionUser();
  if (!user) return [];

  const rows = await prisma.watchProgress.findMany({
    where: {
      userId: user.id,
      completed: false,
      seconds: { gt: 0 },
      duration: { gt: 0 },
      episode: { status: "PUBLISHED" },
    },
    orderBy: { updatedAt: "desc" },
    take: CONTINUE_WATCHING_LIMIT,
    select: { episodeId: true, seconds: true, duration: true },
  });
  if (rows.length === 0) return [];

  const episodes = await contentRepository.getEpisodesByIds(rows.map((row) => row.episodeId));
  const episodesById = new Map(episodes.map((episode) => [episode.id, episode]));

  const seriesIds = [...new Set(episodes.map((episode) => episode.seriesId).filter(Boolean))];
  const seriesList = await contentRepository.getSeriesByIds(seriesIds);
  const seriesById = new Map(seriesList.map((series) => [series.id, series]));

  return rows.flatMap((row) => {
    // Can be missing if the episode was unpublished/deleted between the two
    // queries above -- drop it rather than show a broken card.
    const episode = episodesById.get(row.episodeId);
    if (!episode) return [];

    return [
      {
        episode,
        series: seriesById.get(episode.seriesId) ?? null,
        percent: Math.min(100, (row.seconds / row.duration) * 100),
        remainingSeconds: Math.max(0, row.duration - row.seconds),
      },
    ];
  });
}
