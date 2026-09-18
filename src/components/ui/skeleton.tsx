import { cn } from "@/lib/utils/cn";

/**
 * Base shimmering block. Compose into shape-specific skeletons
 * (see components/content/loading-skeletons.tsx) rather than using
 * this directly in pages.
 *
 * `data-skeleton` is what the startup overlay (components/boot) looks for: it
 * stays up until no placeholder is left on the page, so a first load never
 * reveals skeletons that are about to be swapped for real content.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} data-skeleton="" aria-hidden="true" />;
}
