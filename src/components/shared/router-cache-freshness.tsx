"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { revalidateClientRouterCacheAction } from "@/lib/router-cache/actions";

/** How old a page served from Next's client Router Cache can get. Keep equal to `experimental.staleTimes.dynamic` in next.config.ts. */
const ROUTER_CACHE_MAX_AGE_MS = 900_000;
/** After a failed background refresh (offline, server hiccup), try again this much later rather than on every navigation. */
const RETRY_AFTER_FAILURE_MS = 30_000;

// Per tab (module state only exists in the browser bundle's lifetime; effects never run on the server).
let lastRefreshAt = Date.now();
let isRefreshing = false;

/**
 * Stale-while-revalidate for server-rendered pages.
 *
 * `staleTimes.dynamic` lets a revisited page render instantly from the Router
 * Cache instead of re-showing its loading.tsx skeleton, and expires each
 * entry ROUTER_CACHE_MAX_AGE_MS after it was first shown. The page that's
 * currently open isn't covered by that, though: a tab left on one page (or
 * in the background) keeps showing what it rendered. So on the first
 * navigation, or return to the tab, after the max age, this revalidates in
 * the background: the current page keeps its content while a fresh render
 * loads (a transition -- no skeleton, client state preserved), and the rest
 * of the Router Cache is dropped so other pages load fresh next time.
 *
 * Deliberately not router.refresh(): when its request fails, Next falls back
 * to a full browser navigation, which would replace perfectly good cached
 * content with an error page. revalidateClientRouterCacheAction() does the
 * same refresh but simply rejects on failure, leaving the page as it is.
 *
 * Mutations don't depend on this -- their Server Actions already purge the
 * Router Cache through revalidatePath / cookie changes.
 */
export function RouterCacheFreshness() {
  const pathname = usePathname();

  useEffect(() => {
    async function refreshIfStale() {
      if (isRefreshing || Date.now() - lastRefreshAt < ROUTER_CACHE_MAX_AGE_MS) return;
      if (!navigator.onLine) return;
      isRefreshing = true;
      lastRefreshAt = Date.now();
      try {
        await revalidateClientRouterCacheAction();
      } catch {
        // Keep the cached page; retry a little later. (A redirect -- e.g. an
        // admin session that was revoked -- has already been applied by the
        // router by the time it rejects here.)
        lastRefreshAt = Date.now() - ROUTER_CACHE_MAX_AGE_MS + RETRY_AFTER_FAILURE_MS;
      } finally {
        isRefreshing = false;
      }
    }

    void refreshIfStale();

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void refreshIfStale();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [pathname]);

  return null;
}
