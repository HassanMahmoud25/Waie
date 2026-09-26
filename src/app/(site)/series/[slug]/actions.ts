"use server";

import { contentRepository } from "@/lib/repositories";
import type { CursorPage } from "@/lib/pagination";
import type { Episode } from "@/types/episode";

/**
 * Backs the series page's incremental "load more" episode list -- called
 * from the client once the visitor scrolls to the end of the currently
 * loaded batch (see hooks/use-cursor-pagination.ts). A thin passthrough to
 * the repository's own cursor-paginated, database-level query: this never
 * loads the series' full episode list itself.
 */
export async function loadMoreSeriesEpisodesAction(seriesId: string, cursor: string | null): Promise<CursorPage<Episode>> {
  return contentRepository.listEpisodesBySeriesCursor(seriesId, { cursor });
}
