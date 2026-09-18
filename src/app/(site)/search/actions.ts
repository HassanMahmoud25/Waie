"use server";

import { contentRepository } from "@/lib/repositories";
import type { SearchResults } from "@/types/search";
import type { Topic } from "@/types/topic";

/** Backs the live search modal (see components/search/search-modal.tsx) — called on every keystroke (debounced client-side), so it stays a thin passthrough to the repository. */
export async function searchContentAction(query: string): Promise<SearchResults> {
  return contentRepository.search(query);
}

/** Quick-browse chips shown in the modal before the visitor types anything. */
export async function listQuickTopicsAction(): Promise<Topic[]> {
  return contentRepository.listTopics();
}
