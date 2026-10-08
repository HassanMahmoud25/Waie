"use client";

import { RouteError } from "@/components/shared/route-error";

/**
 * Failures above the route groups' own boundaries: the (site) layout itself
 * (a signed-in visitor's library/notification reads) and the auth pages.
 */
export default function RootError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError reset={reset} />;
}
