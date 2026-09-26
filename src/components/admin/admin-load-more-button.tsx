"use client";

import { CircleAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Admin's own "load more" control -- an explicit button rather than the
 * public site's IntersectionObserver sentinel (see LoadMoreSentinel), matching
 * how every other admin list/action in this dashboard already works: a
 * deliberate click, not an ambient scroll trigger. Same
 * Loader2-while-busy convention as every other admin button (see
 * CollectionEditor).
 */
export function AdminLoadMoreButton({
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
  if (!hasMore) return null;

  return (
    <div className="mt-4 flex flex-col items-center gap-3">
      {error && (
        <p role="alert" className="admin-notice admin-notice--danger text-sm font-bold">
          <CircleAlert size={16} aria-hidden="true" />
          {error}
        </p>
      )}
      <Button
        type="button"
        variant="secondary"
        onClick={onLoadMore}
        disabled={isLoading}
        aria-busy={isLoading}
        icon={isLoading ? <Loader2 className="animate-spin" size={16} aria-hidden="true" /> : undefined}
        iconPosition="start"
      >
        {isLoading ? "جارٍ التحميل…" : "تحميل المزيد"}
      </Button>
    </div>
  );
}
