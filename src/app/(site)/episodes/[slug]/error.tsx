"use client";

import { CircleAlert, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/content/empty-state";

/**
 * Route-level failure for the Episode page (e.g. the database is
 * unreachable): the frame survives, EmptyState explains and offers a retry.
 * Mirrors admin/error.tsx's shape/wording -- EmptyState is this route's own
 * equivalent of the admin panel/tile classes, already used site-wide for
 * every other async/optional section on this same page (recommendations,
 * transcript, mind map). `error` itself is never rendered: it can carry a
 * raw database/server message, and Next only guarantees `digest` is safe to
 * show, which isn't useful to a visitor either.
 */
export default function EpisodeError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="container py-24">
      <EmptyState
        icon={CircleAlert}
        title="تعذّر تحميل هذه الحلقة"
        description="حدث خطأ أثناء جلب البيانات. حاول مرة أخرى خلال لحظات."
        action={
          <Button onClick={reset} icon={<RotateCw size={16} aria-hidden="true" />} iconPosition="start">
            إعادة المحاولة
          </Button>
        }
      />
    </main>
  );
}
