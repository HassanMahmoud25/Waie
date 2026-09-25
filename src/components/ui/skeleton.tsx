import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Base shimmering block. Compose into shape-specific skeletons
 * (see components/content/loading-skeletons.tsx) rather than using
 * this directly in pages.
 *
 * `tone="strong"` is for a placeholder drawn *on top of* another one (text bars
 * over a hero- or banner-sized block), which needs a step more contrast than
 * the surface underneath it. `tone="on-dark"` is for a placeholder drawn over
 * a dark surface (e.g. the admin overview's cinematic quick-add card), where
 * the light-theme `--surface`/`--line` tokens both `default` and `strong` use
 * would go invisible.
 *
 * `data-skeleton` is what the startup overlay (components/boot) looks for: it
 * stays up until no placeholder is left on the page, so a first load never
 * reveals skeletons that are about to be swapped for real content.
 */
export function Skeleton({
  className,
  tone = "default",
  children,
}: {
  className?: string;
  tone?: "default" | "strong" | "on-dark";
  children?: ReactNode;
}) {
  return (
    <div
      className={cn("skeleton", tone !== "default" && `skeleton--${tone}`, className)}
      data-skeleton=""
      aria-hidden="true"
    >
      {children}
    </div>
  );
}
