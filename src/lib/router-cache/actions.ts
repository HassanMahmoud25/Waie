"use server";

import { revalidatePath } from "next/cache";

/**
 * A path no route renders, so revalidating it purges no server-side data
 * (e.g. the podcast feed's cached fetch) -- but it still marks the action as
 * "revalidated", which makes Next send back a fresh render of the caller's
 * current page and drop the client Router Cache. That's exactly a background
 * refresh, with one difference from router.refresh(): if the request fails,
 * the action just rejects and the cached page stays on screen, instead of
 * Next falling back to a full browser navigation (an error page while
 * offline). See components/shared/router-cache-freshness.tsx.
 *
 * Needs no authorization of its own: it reads nothing and writes nothing,
 * and the re-render runs the current page's own checks (requireAdmin() etc.)
 * with the caller's own cookies.
 */
const CLIENT_ROUTER_CACHE_PATH = "/__router-cache";

export async function revalidateClientRouterCacheAction(): Promise<void> {
  revalidatePath(CLIENT_ROUTER_CACHE_PATH);
}
