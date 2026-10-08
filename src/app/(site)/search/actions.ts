"use server";

import { contentRepository } from "@/lib/repositories";
import { DEFAULT_PAGE_SIZE, paginateByCursor, type CursorPage } from "@/lib/pagination";
import type { SearchPreview } from "@/types/search";
import type { Episode } from "@/types/episode";
import type { Topic } from "@/types/topic";

/** Episodes the search modal lists; the rest are a click away on /search. */
const PREVIEW_EPISODE_LIMIT = 8;
/** Longer input can't be a real query -- don't normalize and scan the catalog for it. */
const MAX_QUERY_LENGTH = 200;

/**
 * Backs the live search modal (see components/search/search-modal.tsx) — called on every
 * debounced keystroke, so it returns only what the modal shows: a short prefix like "ال"
 * matches nearly the whole catalog (~100 KB of full episodes) otherwise.
 */
export async function searchContentAction(query: string): Promise<SearchPreview> {
  const results = await contentRepository.search(String(query).slice(0, MAX_QUERY_LENGTH));
  return {
    ...results,
    episodes: results.episodes.slice(0, PREVIEW_EPISODE_LIMIT),
    totalEpisodes: results.episodes.length,
  };
}

/**
 * Backs the search results page's incremental "load more" episode grid.
 * contentRepository.search() always re-ranks the full matching set first --
 * that full scan/rank pass is unavoidable (see its own doc comment on the
 * Arabic-normalization reasoning) and never changes here. What changes is
 * that only one batch of the *already-ranked* episodes, resumed after
 * `cursor`, is ever returned -- the client never receives more than it asked
 * for, and a cursor only ever makes sense paired with the exact query it was
 * issued under (a different query re-ranks from scratch).
 */
export async function loadMoreSearchEpisodesAction(query: string, cursor: string | null): Promise<CursorPage<Episode>> {
  const results = await contentRepository.search(String(query).slice(0, MAX_QUERY_LENGTH));
  return paginateByCursor(results.episodes, cursor, (episode) => episode.id, DEFAULT_PAGE_SIZE);
}

/** Quick-browse chips shown in the modal before the visitor types anything. */
export async function listQuickTopicsAction(): Promise<Topic[]> {
  return contentRepository.listTopics();
}
