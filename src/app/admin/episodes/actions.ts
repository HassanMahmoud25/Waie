"use server";

import { requireAdmin } from "@/lib/auth/server";
import { contentRepository } from "@/lib/repositories";
import type { CursorPage } from "@/lib/pagination";
import type { Episode } from "@/types/episode";
import type { ContentStatus } from "@/types/content-status";

/**
 * Backs the admin episodes list's incremental "load more" -- same reasoning
 * as the public load-more actions (series/topics/search), plus the ADMIN
 * check every admin Server Action requires. `status`/`query` are resent on
 * every call rather than trusted from a stored cursor, so a cursor can never
 * accidentally get reused against a filter/status it wasn't issued under --
 * switching tabs or typing a new search always starts a fresh page render
 * (cursor null) rather than continuing an old one.
 */
export async function loadMoreAdminEpisodesAction(
  status: ContentStatus | null,
  query: string,
  cursor: string | null,
): Promise<CursorPage<Episode>> {
  await requireAdmin();
  return contentRepository.searchAdminEpisodesCursor({ status, query, cursor });
}
