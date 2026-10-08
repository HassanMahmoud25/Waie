import { QueryClient, type Query } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";

/** Per-dataset freshness. Content changes only through admin edits / YouTube sync, which invalidate explicitly (lib/query/invalidate.ts); these are the fallback for changes made elsewhere. */
export const STALE_TIME = {
  /** Published episodes / series covers looked up by id. */
  content: 5 * 60_000,
  /** The quick-browse topic chips -- topics are created/renamed rarely. */
  topics: 10 * 60_000,
  /** Live search results -- short, so retyping a query within the minute is free but results never lag far behind the catalog. */
  search: 60_000,
} as const;

/** How long an unused search result stays in memory. Kept short: each one can carry a full ranked episode list. */
export const SEARCH_GC_TIME = 2 * 60_000;
/** Hard cap on cached search queries, on top of SEARCH_GC_TIME -- typing produces one entry per debounced keystroke, and this keeps that bounded however fast someone types. */
const MAX_CACHED_SEARCHES = 20;

function capSearchEntries(client: QueryClient, justAdded: Query) {
  const evictable = client
    .getQueryCache()
    .findAll({ queryKey: queryKeys.search.all })
    .filter((query) => query !== justAdded && query.getObserversCount() === 0)
    .sort((a, b) => a.state.dataUpdatedAt - b.state.dataUpdatedAt);
  const excess = evictable.length - (MAX_CACHED_SEARCHES - 1);
  for (const query of evictable.slice(0, Math.max(0, excess))) client.getQueryCache().remove(query);
}

/**
 * Created once per browser tab (QueryProvider holds it in state) -- and once
 * per request during SSR, so nothing is ever shared between visitors on the
 * server. No query runs on the server: they're all client-triggered, so no
 * dehydrate/hydrate step is needed.
 */
export function makeQueryClient(): QueryClient {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME.content,
        gcTime: 5 * 60_000,
        retry: 1,
        // Page-level freshness is RouterCacheFreshness's job; refetching these
        // small lookups on every tab focus would only add requests.
        refetchOnWindowFocus: false,
      },
    },
  });

  client.getQueryCache().subscribe((event) => {
    if (event.type === "added" && event.query.queryKey[0] === queryKeys.search.all[0]) {
      // Deferred so eviction never runs inside the cache's own dispatch.
      queueMicrotask(() => capSearchEntries(client, event.query));
    }
  });

  return client;
}
