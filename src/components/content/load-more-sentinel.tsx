"use client";

import { useLoadMoreSentinel } from "@/hooks/use-load-more-sentinel";

/**
 * The public-facing "reached the end, loading more" marker for an
 * incrementally-loaded episode grid (series/topic pages, search results).
 * Renders nothing once the collection is exhausted. While more episodes
 * remain, it's an invisible IntersectionObserver target that quietly
 * triggers the next batch -- the pulsing dot + label only actually appear
 * while that batch is in flight, echoing the same accent-glow pulse the
 * Series Journey's own "traveler" dot uses (see .journey-traveler__pulse in
 * globals.css) rather than a generic spinner.
 */
export function LoadMoreSentinel({
  hasMore,
  isLoading,
  error,
  onLoadMore,
}: {
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
  onLoadMore: () => void;
}) {
  const sentinelRef = useLoadMoreSentinel({ hasMore, onLoadMore });

  if (!hasMore) return null;

  return (
    <div ref={sentinelRef} className="load-more">
      {error ? (
        <div role="alert" className="load-more__row">
          <p className="load-more__text load-more__text--error">{error}</p>
          <button type="button" className="btn btn-secondary" onClick={onLoadMore}>
            إعادة المحاولة
          </button>
        </div>
      ) : isLoading ? (
        <div role="status" aria-live="polite" className="load-more__row">
          <span className="load-more__pulse" aria-hidden="true" />
          <span className="load-more__text">جارٍ تحميل المزيد</span>
        </div>
      ) : null}
    </div>
  );
}
