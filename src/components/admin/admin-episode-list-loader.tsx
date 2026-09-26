"use client";

import { useMemo } from "react";
import type { Episode } from "@/types/episode";
import type { SeriesWithStats } from "@/types/series";
import type { ContentStatus } from "@/types/content-status";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";
import { EpisodeRow } from "@/components/admin/episode-row";
import { AdminLoadMoreButton } from "@/components/admin/admin-load-more-button";
import { loadMoreAdminEpisodesAction } from "@/app/admin/episodes/actions";

/**
 * The admin episodes list's incremental "load more" -- starts from the
 * batch the server already rendered for the active status tab/query and
 * appends further batches on click, never replacing what's shown. Give this
 * a `key` on `${status}-${query}` at the call site so switching tabs or
 * searching resets to a fresh batch instead of appending onto a list that no
 * longer matches the active filter.
 */
export function AdminEpisodeListLoader({
  initialEpisodes,
  initialCursor,
  status,
  query,
  series,
}: {
  initialEpisodes: Episode[];
  initialCursor: string | null;
  status: ContentStatus | null;
  query: string;
  series: SeriesWithStats[];
}) {
  const seriesById = useMemo(() => new Map(series.map((s) => [s.id, s])), [series]);
  const { items, hasMore, isLoading, error, loadMore } = useCursorPagination<Episode>({
    initialItems: initialEpisodes,
    initialCursor,
    fetchMore: (cursor) => loadMoreAdminEpisodesAction(status, query, cursor),
  });

  return (
    <>
      <div className="admin-panel">
        {items.map((episode) => (
          <EpisodeRow
            episode={episode}
            seriesTitle={seriesById.get(episode.seriesId)?.title ?? "بلا سلسلة"}
            showDuration
            key={episode.id}
          />
        ))}
      </div>
      <AdminLoadMoreButton hasMore={hasMore} isLoading={isLoading} error={error} onLoadMore={loadMore} />
    </>
  );
}
