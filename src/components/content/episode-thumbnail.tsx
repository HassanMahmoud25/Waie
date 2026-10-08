"use client";

import { useEffect, useRef, useState } from "react";
import Image, { type ImageProps } from "next/image";
import { youtubeThumbnailVariant } from "@/lib/utils/youtube-thumbnail";

/** A harmless cache-bust: YouTube's image CDN ignores unknown query params, so this forces a genuinely new request instead of the browser reusing the failed one. */
function withRetryParam(src: string, attempt: number): string {
  const base = src.split("?")[0]!;
  return `${base}?_retry=${attempt}`;
}

/**
 * Drop-in next/image for an episode's (YouTube-derived) thumbnail, hardened
 * against two real failure modes:
 *
 * 1. A transient load failure (seen most on pages loading many thumbnails at
 *    once). First retry is the same URL, cache-busted.
 * 2. maxresdefault.jpg not existing yet for a very fresh upload. Second retry
 *    falls back to hqdefault, which YouTube generates at upload time.
 *
 * Then it gives up (no retry loop).
 *
 * `unoptimized` on purpose: YouTube already serves compressed JPEGs, and in
 * production the Vercel Image Optimization quota is exhausted -- any uncached
 * /_next/image transformation answers 402, so ytimg images routed through the
 * optimizer break. Going straight to i.ytimg.com sidesteps the quota.
 */
export function EpisodeThumbnail({ src, alt, ...props }: Omit<ImageProps, "src"> & { src: string }) {
  const [resolvedSrc, setResolvedSrc] = useState(src);
  const attemptRef = useRef(0);

  useEffect(() => {
    setResolvedSrc(src);
    attemptRef.current = 0;
  }, [src]);

  return (
    <Image
      {...props}
      alt={alt}
      src={resolvedSrc}
      unoptimized
      onError={() => {
        attemptRef.current += 1;
        if (attemptRef.current === 1) {
          setResolvedSrc(withRetryParam(src, attemptRef.current));
          return;
        }
        if (attemptRef.current === 2) {
          const fallback = youtubeThumbnailVariant(src, "hqdefault");
          if (fallback) setResolvedSrc(fallback);
        }
      }}
    />
  );
}
