"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type RevealState = "idle" | "hidden" | "visible";

/**
 * Scroll-triggered fade/rise-in, used to stagger the homepage's below-the-fold
 * sections into view. Deliberately fails safe: the default ("idle") state
 * renders with no extra class at all, so server-rendered HTML, crawlers, and
 * a no-JS browser all see the content fully visible and in its normal
 * position. Only once mounted do we check via IntersectionObserver whether
 * the element is genuinely off-screen -- and only then do we apply the
 * hidden starting state, immediately before animating it back in as it
 * scrolls into view. An element already in the viewport at mount (e.g. on a
 * short page) is marked visible right away with no flash.
 */
export function Reveal({
  children,
  className,
  delayMs = 0,
}: {
  children: ReactNode;
  className?: string;
  /** Stagger multiple Reveal siblings by giving each an increasing delay. */
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<RevealState>("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState("visible");
          observer.disconnect();
        } else {
          setState((current) => (current === "idle" ? "hidden" : current));
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(state === "hidden" && "reveal-hidden", state === "visible" && "reveal-visible", className)}
      style={delayMs ? ({ "--reveal-delay": `${delayMs}ms` } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
