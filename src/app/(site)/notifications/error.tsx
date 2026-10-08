"use client";

import { RouteError } from "@/components/shared/route-error";

export default function NotificationsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError title="تعذّر تحميل إشعاراتك" reset={reset} />;
}
