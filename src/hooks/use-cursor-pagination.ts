"use client";

import { useCallback, useRef, useState } from "react";
import type { CursorPage } from "@/lib/pagination";

/**
 * Client-side state for one incrementally-loaded episode collection: starts
 * from the batch the server already rendered, and appends (never replaces)
 * each further batch as `loadMore()` is called. Backs every "load more" UI
 * in the app (series/topic episode grids, search results, admin's episode
 * list) -- each just supplies its own server action as `fetchMore`.
 *
 * Guards against every double-fetch scenario a sentinel/button can trigger:
 * `isLoadingRef` (a ref, not state, so it's already true for a second call
 * that fires before the first re-render) blocks concurrent calls, including
 * the two effect-cleanup/rerun cycles React Strict Mode performs in dev, and
 * `nextCursor === null` blocks calling once the collection is exhausted.
 * `cancelled`/mounted tracking on the caller side (see LoadMoreSentinel) is
 * still the caller's job for the "navigated away mid-request" case.
 */
export function useCursorPagination<T>({
  initialItems,
  initialCursor,
  fetchMore,
}: {
  initialItems: T[];
  initialCursor: string | null;
  fetchMore: (cursor: string) => Promise<CursorPage<T>>;
}) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isLoadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || cursor === null) return;
    isLoadingRef.current = true;
    setIsLoading(true);
    setError(null);
    try {
      const nextPage = await fetchMore(cursor);
      setItems((prev) => [...prev, ...nextPage.items]);
      setCursor(nextPage.nextCursor);
    } catch {
      setError("تعذّر تحميل المزيد. حاول مرة أخرى.");
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [cursor, fetchMore]);

  return { items, hasMore: cursor !== null, isLoading, error, loadMore };
}
