import type { ReactNode } from "react";

/** Screen-reader-only text: visible to assistive tech, not sighted users. */
export function VisuallyHidden({ children }: { children: ReactNode }) {
  return <span className="sr-only">{children}</span>;
}
