"use server";

import { contentRepository } from "@/lib/repositories";
import { DEFAULT_PAGE_SIZE, paginateByCursor, type CursorPage } from "@/lib/pagination";
import type { SearchResults } from "@/types/search";
import type { Episode } from "@/types/episode";
import type { Topic } from "@/types/topic";

/** Backs the live search modal (see components/search/search-modal.tsx) — called on every keystroke (debounced client-side), so it stays a thin passthrough to the repository. */
export async function searchContentAction(query: string): Promise<SearchResults> {
  return contentRepository.search(query);
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
  const results = await contentRepository.search(query);
  return paginateByCursor(results.episodes, cursor, (episode) => episode.id, DEFAULT_PAGE_SIZE);
}

/** Quick-browse chips shown in the modal before the visitor types anything. */
export async function listQuickTopicsAction(): Promise<Topic[]> {
  return contentRepository.listTopics();
}
