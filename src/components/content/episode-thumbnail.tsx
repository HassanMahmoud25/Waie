"use client";

import { useEffect, useRef, useState } from "react";
import Image, { type ImageProps } from "next/image";

const YOUTUBE_IMAGE_HOST = "i.ytimg.com";

/**
 * YouTube auto-generates default/medium/high (hqdefault) thumbnails for
 * every video at upload time -- always available -- but maxresdefault (what
 * an episode's thumbnail normally resolves to, for quality; see
 * prisma-content-repository.ts's toEpisode) can lag by minutes to hours
 * right after a very fresh upload. Null when `src` isn't an i.ytimg.com
 * maxresdefault URL (nothing to fall back to).
 */
function toHqDefault(src: string): string | null {
  const base = src.split("?")[0]!;
  if (!base.includes(YOUTUBE_IMAGE_HOST) || !base.endsWith("/maxresdefault.jpg")) return null;
  return base.replace("/maxresdefault.jpg", "/hqdefault.jpg");
}

/** A harmless cache-bust: YouTube's image CDN ignores unknown query params and Next's own image optimizer keys its (successful-only) cache off the full url string, so this forces a genuinely new attempt instead of the browser/optimizer silently reusing whatever just failed. */
function withRetryParam(src: string, attempt: number): string {
  const base = src.split("?")[0]!;
  return `${base}?_retry=${attempt}`;
}

/**
 * Drop-in next/image for an episode's (YouTube-derived) thumbnail, hardened
 * against two distinct, confirmed-real failure modes (2026-09-24 -- see the
 * thumbnail-revalidation-admin-gap / episode-thumbnail-retry memories):
 *
 * 1. A load that fails for reasons unrelated to the image actually existing
 *    -- every layer (DB, repository, the direct YouTube URL, Next's own
 *    image optimizer) was independently confirmed to return the *same*
 *    correct URL/valid bytes for episodes that still rendered broken in the
 *    browser, worst on pages loading many thumbnails at once (the admin
 *    list) and fixed by nothing more than a fresh mount (navigating away and
 *    back) -- i.e. a transient fetch failure, not a stale/wrong value. First
 *    retry is the exact same URL (cache-busted so it's a genuinely new
 *    attempt, not a silently-reused failure).
 * 2. maxresdefault.jpg genuinely not existing yet for a very fresh upload
 *    (a real external YouTube timing limitation). Second retry falls back
 *    to hqdefault, which YouTube generates for every video at upload time.
 *
 * Gives up after that (no infinite retry loop). Scoped to the surfaces most
 * likely to render a just-published episode soon after publish -- admin
 * list/editor, notifications, continue-watching, and the public episode
 * rails.
 *
 * `unoptimized`: YouTube's CDN already serves a correctly-sized, compressed
 * JPEG for every thumbnail variant this app requests -- routing it through
 * Vercel's own Image Optimization API re-encodes something that doesn't need
 * re-encoding, and every distinct (url, width, quality) combination counts
 * against that API's monthly transformation quota. With ~100+ episodes times
 * several responsive breakpoints times every surface that shows a thumbnail,
 * that quota is exhausted well before the month is (confirmed in production:
 * once exhausted, Vercel returns 402 OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED
 * for any new/uncached transformation while already-cached ones keep working
 * -- which is why the same episode could look fine on one surface/width and
 * broken on another, fine on localhost, which never goes through this API,
 * and flip on navigation vs. refresh depending only on which exact width got
 * requested and whether that one happened to be cached already). Going
 * straight to i.ytimg.com sidesteps that quota entirely.
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
          const fallback = toHqDefault(src);
          if (fallback) setResolvedSrc(fallback);
        }
      }}
    />
  );
}
