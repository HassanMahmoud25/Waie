"use server";

import { contentRepository } from "@/lib/repositories";
import type { CursorPage } from "@/lib/pagination";
import type { Episode } from "@/types/episode";

/** Backs the topic page's incremental "load more" episode grid -- see series/[slug]/actions.ts's identical reasoning. */
export async function loadMoreTopicEpisodesAction(topicId: string, cursor: string | null): Promise<CursorPage<Episode>> {
  return contentRepository.listEpisodesByTopicCursor(topicId, { cursor });
}
