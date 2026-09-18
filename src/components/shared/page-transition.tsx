"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Cross-fades routed page content on navigation. Keying the wrapper by
 * pathname forces a remount on every route change, which restarts the CSS
 * keyframe animation in globals.css -- no JS-timed class flip needed (same
 * reasoning as the search modal / user menu animations: a `@keyframes`
 * animation starts the moment the element mounts, driven by the browser's
 * own timeline, regardless of rAF/JS frame timing).
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-transition">
      {children}
    </div>
  );
}
