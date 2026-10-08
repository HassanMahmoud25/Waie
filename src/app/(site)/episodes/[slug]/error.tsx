"use client";

import { RouteError } from "@/components/shared/route-error";

export default function EpisodeError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError title="تعذّر تحميل هذه الحلقة" reset={reset} />;
}
