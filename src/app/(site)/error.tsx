"use client";

import { RouteError } from "@/components/shared/route-error";

/** Any public page that fails to load (e.g. the database is unreachable) -- the header and footer stay. */
export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError reset={reset} />;
}
