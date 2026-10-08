import type { QueryClient, QueryKey } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";

/**
 * Mutation -> client query dependencies. Page payloads (Router Cache) are
 * already purged by the Server Action itself -- every mutation below calls
 * revalidatePath, which makes Next drop the client Router Cache -- so this
 * only covers what TanStack Query holds:
 *
 * - episode create/update/publish/unpublish/delete: by-id episode lookups,
 *   series cover thumbnails (derived from episode thumbnails), search results.
 * - series create/update/publish/unpublish/delete: cover thumbnails, search.
 * - topic create/update/delete: quick-browse topics, search.
 * - person update/delete: episodes embed their participants, and search
 *   matches on them.
 * - YouTube sync: creates/updates episodes and playlists (series).
 *
 * Transcript / mind map / recommendation edits only change the episode page
 * itself (server-rendered), so they have no entry here.
 */
const DEPENDENCIES = {
  episode: [queryKeys.episodes.all, queryKeys.series.all, queryKeys.search.all],
  series: [queryKeys.series.all, queryKeys.search.all],
  topic: [queryKeys.topics.all, queryKeys.search.all],
  person: [queryKeys.episodes.all, queryKeys.search.all],
  sync: [queryKeys.episodes.all, queryKeys.series.all, queryKeys.search.all],
} satisfies Record<string, readonly QueryKey[]>;

export type ContentMutation = keyof typeof DEPENDENCIES;

export function invalidateAfterMutation(client: QueryClient, mutation: ContentMutation): void {
  for (const queryKey of DEPENDENCIES[mutation]) void client.invalidateQueries({ queryKey });
}

/**
 * Login / logout / account switch. No query is user-specific, but the id
 * lists behind the by-id lookups are the previous viewer's saves/progress --
 * drop them rather than leave them for whoever signs in next in this tab.
 */
export function clearViewerQueries(client: QueryClient): void {
  client.removeQueries({ queryKey: queryKeys.episodes.all });
  client.removeQueries({ queryKey: queryKeys.series.all });
}
