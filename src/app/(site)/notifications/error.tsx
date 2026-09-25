"use client";

import { CircleAlert, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/content/empty-state";

/**
 * Route-level failure for /notifications (e.g. the database is
 * unreachable): mirrors episodes/[slug]/error.tsx's shape/wording exactly.
 * `error` itself is never rendered -- it can carry a raw database/server
 * message, and Next only guarantees `digest` is safe to show, which isn't
 * useful to a visitor either.
 */
export default function NotificationsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="container py-24">
      <EmptyState
        icon={CircleAlert}
        title="تعذّر تحميل إشعاراتك"
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
