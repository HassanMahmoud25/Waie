import { getImageProps } from "next/image";

/** Tailwind's `md` breakpoint (48rem): the desktop crop is used from here up. */
const DESKTOP_MEDIA = "(min-width: 48rem)";

/**
 * A full-bleed, above-the-fold image with its own crop for phones, as a
 * single <picture> so each device downloads exactly one of the two. (Two
 * `priority` <Image>s hidden by CSS each get an unconditional preload, so
 * every visitor downloaded both.)
 *
 * Fills its positioned parent, like <Image fill>. Remote images (YouTube
 * thumbnails used as a fallback cover) skip the optimizer -- see
 * EpisodeThumbnail for why it can't be relied on for them in production.
 */
export function ArtDirectedImage({
  src,
  mobileSrc,
  alt,
  className,
}: {
  src: string;
  mobileSrc: string;
  alt: string;
  className?: string;
}) {
  const common = { alt, fill: true, sizes: "100vw", priority: true } as const;
  const desktop = getImageProps({ ...common, src, unoptimized: !src.startsWith("/") }).props;
  const mobile = getImageProps({ ...common, src: mobileSrc, unoptimized: !mobileSrc.startsWith("/") }).props;

  return (
    <picture>
      <source media={DESKTOP_MEDIA} srcSet={desktop.srcSet ?? desktop.src} sizes={desktop.sizes} />
      <img {...mobile} alt={alt} className={className} />
    </picture>
  );
}
