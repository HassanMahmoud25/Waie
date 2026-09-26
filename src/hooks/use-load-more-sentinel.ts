"use client";

import { useEffect, useRef } from "react";

/**
 * Fires `onLoadMore` when the returned ref's element scrolls into view --
 * the IntersectionObserver-based trigger for every "load more" episode grid
 * in the app. A small rootMargin starts the fetch a little before the
 * sentinel is actually on screen, just enough to hide that one request's own
 * latency -- this still only ever loads the *next* batch, never several
 * batches ahead, so it isn't prefetching in the aggressive sense.
 *
 * Duplicate-request safety lives in useCursorPagination's loadMore itself
 * (an isLoadingRef guard plus the `cursor === null` check), not here -- this
 * hook only decides *when* to call it, never whether it's safe to.
 */
export function useLoadMoreSentinel({ hasMore, onLoadMore }: { hasMore: boolean; onLoadMore: () => void }) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  useEffect(() => {
    if (!hasMore) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMoreRef.current();
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore]);

  return sentinelRef;
}
