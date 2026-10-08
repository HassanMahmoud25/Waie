"use client";

import { CircleAlert, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/content/empty-state";

/**
 * Body of the public site's error.tsx files (e.g. the database is
 * unreachable): explains and offers a retry. The error itself is never shown
 * -- it can carry a raw server message, and Next only guarantees `digest` is
 * safe to expose, which means nothing to a visitor.
 */
export function RouteError({
  title = "تعذّر تحميل هذه الصفحة",
  reset,
}: {
  title?: string;
  reset: () => void;
}) {
  return (
    <main className="container py-24">
      <EmptyState
        icon={CircleAlert}
        title={title}
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
