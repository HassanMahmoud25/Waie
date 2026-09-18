"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Horizontal, no-scrollbar rail for episode/series cards. Children are
 * typically Server Components (EpisodeCard, etc.) passed straight through
 * via `children` — this wrapper only owns the scroll behavior, so nothing
 * inside the rail needs to become a Client Component.
 *
 * Arrow buttons are a progressive enhancement on top of native touch/trackpad
 * scrolling (which always works); they're hidden below desktop widths where
 * swipe is the natural interaction anyway, and hidden entirely when the rail
 * has too few children to overflow its own width -- otherwise a short rail
 * (e.g. one or two continue-watching cards) shows a "next" arrow with
 * nowhere left to scroll to.
 */
export function ContentRail({ children, className }: { children: ReactNode; className?: string }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const checkOverflow = () => setHasOverflow(el.scrollWidth > el.clientWidth + 1);

    checkOverflow();
    const observer = new ResizeObserver(checkOverflow);
    observer.observe(el);
    return () => observer.disconnect();
    // Re-measure whenever the rail's actual items change (e.g. the
    // continue-watching rail, whose children arrive after hydration).
  }, [children]);

  const scroll = (amount: number) => {
    scrollerRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {hasOverflow && (
        <button
          type="button"
          aria-label="السابق"
          className="rail-arrow icon-btn absolute -right-4 top-1/2 z-10 -translate-y-1/2 shadow-sm"
          onClick={() => scroll(320)}
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      )}

      <div ref={scrollerRef} className={cn("rail", className)}>
        {children}
      </div>

      {hasOverflow && (
        <button
          type="button"
          aria-label="التالي"
          className="rail-arrow icon-btn absolute -left-4 top-1/2 z-10 -translate-y-1/2 shadow-sm"
          onClick={() => scroll(-320)}
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
