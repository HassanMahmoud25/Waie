/**
 * The one place TanStack Query keys are built. Only server state the *client*
 * fetches lives in the query cache (search modal, quick-browse topics, and the
 * by-id lookups behind Library / Continue Watching) -- every page's own data
 * is server-rendered and cached by Next's client Router Cache instead (see
 * `experimental.staleTimes` in next.config.ts and RouterCacheFreshness).
 *
 * Each dataset hangs off a single root (`["episodes"]`, `["series"]`, ...), so
 * a mutation can invalidate exactly the roots it touches -- see
 * lib/query/invalidate.ts -- without clearing unrelated cached data.
 *
 * Nothing here is user-specific: every query returns published, public
 * content, so a key never needs a user id. The id lists behind the by-id
 * lookups do reveal what a viewer saved/watched, which is why login/logout
 * still drop them (clearViewerQueries).
 */

/** Order-insensitive, so the same set of ids always shares one cache entry. */
function sortedIds(ids: readonly string[]): string[] {
  return [...new Set(ids)].sort();
}

/** Same query modulo surrounding/repeated whitespace -> same cache entry. */
export function normalizeSearchQuery(query: string): string {
  return query.trim().replace(/\s+/g, " ");
}

export const queryKeys = {
  episodes: {
    all: ["episodes"] as const,
    byIds: (ids: readonly string[]) => ["episodes", "by-ids", sortedIds(ids)] as const,
  },
  series: {
    all: ["series"] as const,
    coverThumbnails: (ids: readonly string[]) => ["series", "cover-thumbnails", sortedIds(ids)] as const,
  },
  topics: {
    all: ["topics"] as const,
    quickList: () => ["topics", "quick-list"] as const,
  },
  search: {
    all: ["search"] as const,
    results: (query: string) => ["search", "results", normalizeSearchQuery(query)] as const,
  },
};
