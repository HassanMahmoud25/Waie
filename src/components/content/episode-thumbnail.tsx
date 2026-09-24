"use client";

import { useEffect, useState } from "react";
import Image, { type ImageProps } from "next/image";

const YOUTUBE_IMAGE_HOST = "i.ytimg.com";

/**
 * YouTube auto-generates default/medium/high (hqdefault) thumbnails for
 * every video at upload time -- always available -- but maxresdefault (what
 * an episode's thumbnail normally resolves to, for quality; see
 * prisma-content-repository.ts's toEpisode) can lag by minutes to hours
 * right after a very fresh upload. That's an external YouTube timing
 * limitation, not our own caching/data bug (see the
 * thumbnail-revalidation-admin-gap fix) -- confirmed real (2026-09-24): two
 * episodes published minutes apart showed a broken image in their
 * notification row and the admin editor's YouTube panel while maxresdefault
 * was still generating, self-healing once it became available. Null when
 * `src` isn't an i.ytimg.com maxresdefault URL (nothing to fall back to).
 */
function toHqDefault(src: string): string | null {
  if (!src.includes(YOUTUBE_IMAGE_HOST) || !src.endsWith("/maxresdefault.jpg")) return null;
  return src.replace("/maxresdefault.jpg", "/hqdefault.jpg");
}

/**
 * Drop-in next/image for an episode's (YouTube-derived) thumbnail: on a load
 * error, retries once with the always-available hqdefault derivative before
 * giving up. Scoped to the surfaces most likely to render a just-published
 * episode within that lag window -- a fired notification, the admin list/
 * editor right after creating -- see this file's own doc comment above.
 */
export function EpisodeThumbnail({ src, alt, ...props }: Omit<ImageProps, "src"> & { src: string }) {
  const [resolvedSrc, setResolvedSrc] = useState(src);

  useEffect(() => setResolvedSrc(src), [src]);

  return (
    <Image
      {...props}
      alt={alt}
      src={resolvedSrc}
      onError={() => {
        const fallback = toHqDefault(resolvedSrc);
        if (fallback) setResolvedSrc(fallback);
      }}
    />
  );
}
