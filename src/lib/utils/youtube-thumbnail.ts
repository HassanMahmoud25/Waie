const YOUTUBE_IMAGE_HOST = "i.ytimg.com";

/**
 * The same video's thumbnail at another of the sizes YouTube generates for
 * every upload: mqdefault (320x180, 16:9) or hqdefault (480x360, letterboxed).
 * maxresdefault -- what episode thumbnails normally are -- can lag behind a
 * fresh upload, while these exist from the start. Null when `src` isn't an
 * i.ytimg.com maxresdefault URL (an editor-set image has no variants).
 */
export function youtubeThumbnailVariant(src: string, variant: "mqdefault" | "hqdefault"): string | null {
  const base = src.split("?")[0]!;
  if (!base.includes(YOUTUBE_IMAGE_HOST) || !base.endsWith("/maxresdefault.jpg")) return null;
  return base.replace("/maxresdefault.jpg", `/${variant}.jpg`);
}
