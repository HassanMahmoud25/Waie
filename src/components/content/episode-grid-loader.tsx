"use client";

import { useMemo } from "react";
import type { Episode } from "@/types/episode";
import type { Series } from "@/types/series";
import type { CursorPage } from "@/lib/pagination";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";
import { EpisodeCard } from "@/components/episode/episode-card";
import { LoadMoreSentinel } from "@/components/content/load-more-sentinel";

/**
 * The shared "grid of episode cards that loads more as you scroll" --
 * backs every public episode collection that can grow past one screen
 * (a topic's episodes, search results). Starts from the batch the server
 * already rendered and appends further batches via `fetchMore`, never
 * replacing what's already shown. Each caller supplies its own server
 * action as `fetchMore`; this component only owns the grid + load-more UI.
 */
export function EpisodeGridLoader({
  initialEpisodes,
  initialCursor,
  fetchMore,
  series,
}: {
  initialEpisodes: Episode[];
  initialCursor: string | null;
  fetchMore: (cursor: string) => Promise<CursorPage<Episode>>;
  series: Series[];
}) {
  const seriesById = useMemo(() => new Map(series.map((s) => [s.id, s])), [series]);
  const { items, hasMore, isLoading, error, loadMore } = useCursorPagination<Episode>({
    initialItems: initialEpisodes,
    initialCursor,
    fetchMore,
  });

  return (
    <>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((episode) => (
          <EpisodeCard episode={episode} series={seriesById.get(episode.seriesId) ?? null} key={episode.id} />
        ))}
      </div>
      <LoadMoreSentinel hasMore={hasMore} isLoading={isLoading} error={error} onLoadMore={loadMore} />
    </>
  );
}
