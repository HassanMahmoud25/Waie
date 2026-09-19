import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type BannerProps = {
  href: string;
  imageUrl: string;
  imageAlt: string;
  eyebrow?: string;
  title: string;
  description?: string;
  meta?: string;
  ctaLabel?: string;
  /** "feature" = tall, full-bleed editorial banner (series/collection showcase). "compact" = grid tile. */
  size?: "feature" | "compact";
  /**
   * Fill the parent grid area's height instead of the size's own aspect
   * ratio — for a compact tile sharing a row with a taller feature banner,
   * where the row is auto-sized to the feature and the compact tile would
   * otherwise stop short at its own aspect ratio, leaving blank grid space
   * beneath it.
   */
  stretch?: boolean;
  /**
   * "container" aligns the text block to the page's .container gutter while
   * the image itself bleeds edge-to-edge — used when the banner is rendered
   * full-viewport-width outside any container (the homepage's dark feature
   * section). "block" (default) just pads the text directly, for banners
   * already living inside a grid column.
   */
  align?: "container" | "block";
  priority?: boolean;
  sizes?: string;
  className?: string;
};

/**
 * Reusable full-bleed image banner: the content itself (a photo, not a flat
 * color panel) is the visual identity, with a dark scrim carrying the text.
 * Backs the homepage series bento, collection tiles, and anywhere the product wants
 * a large, image-driven editorial slab instead of another bordered card.
 *
 * The "feature" size only overlays its text on the photo from `md` up, where
 * the slab is wide enough for the copy to sit over a small part of it. Below
 * that, a fixed-ratio box can't hold a title + description + CTA without
 * covering (and clipping) most of the artwork, so it stacks instead: the
 * image stays whole and clear on top, and the same text sits on the dark
 * cinematic surface directly beneath it, inside the same rounded shell.
 */
export function Banner({
  href,
  imageUrl,
  imageAlt,
  eyebrow,
  title,
  description,
  meta,
  ctaLabel = "عرض الحلقات",
  size = "compact",
  stretch = false,
  align = "block",
  priority = false,
  sizes = "100vw",
  className,
}: BannerProps) {
  const isFeature = size === "feature";

  const text = (
    <>
      {eyebrow && (
        <p
          className={cn(
            "eyebrow-pill eyebrow-pill--on-dark w-fit",
            isFeature ? "text-[.7rem]" : "text-[.65rem]",
          )}
        >
          {eyebrow}
        </p>
      )}
      <h3
        className={cn(
          "font-black tracking-[-.03em] text-balance",
          isFeature
            ? "text-2xl leading-[1.3] md:text-4xl md:leading-[1.2] min-[1200px]:text-5xl"
            : "text-xl md:text-2xl",
        )}
      >
        {title}
      </h3>
      {description && (
        <p
          className={cn(
            "max-w-lg leading-7 text-[var(--on-brand-soft)]",
            isFeature ? "line-clamp-2 text-sm md:text-base" : "hidden text-sm sm:block",
          )}
        >
          {description}
        </p>
      )}
      <span className="mt-1 inline-flex items-center gap-2 text-sm font-bold">
        {meta && <span className="text-[var(--on-brand-soft)]">{meta}</span>}
        <span className="glass-dark inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-3.5 py-2 transition-[gap] group-hover:gap-2.5">
          {ctaLabel}
          <ChevronLeft size={15} aria-hidden="true" />
        </span>
      </span>
    </>
  );

  return (
    <Link
      href={href}
      className={cn(
        "hover-zoom group relative overflow-hidden",
        isFeature ? "flex flex-col bg-[var(--cinematic)] md:block" : "block",
        stretch
          ? "h-full"
          : isFeature
            ? "md:max-[1199px]:aspect-[16/8] min-[1200px]:aspect-[21/9]"
            : "aspect-[4/3] sm:aspect-[16/10]",
        align === "block" && "rounded-[var(--radius-banner)]",
        className,
      )}
    >
      <div
        className={cn(
          "media",
          isFeature ? "relative aspect-video shrink-0 md:absolute md:inset-0 md:aspect-auto" : "absolute inset-0",
          // Stacked (feature, < md): the image butts flush against the text panel, so only the outer shell rounds.
          align === "block" && (isFeature ? "rounded-none md:rounded-[var(--radius-banner)]" : "rounded-[var(--radius-banner)]"),
        )}
      >
        <Image src={imageUrl} alt={imageAlt} fill priority={priority} sizes={sizes} className="object-cover" />
        <span className={cn("scrim", isFeature && "hidden md:block")} aria-hidden="true" />
      </div>

      {align === "container" ? (
        <div
          className={cn(
            "container relative flex flex-col gap-3 text-white md:h-full md:justify-end md:py-14",
            isFeature ? "py-5" : "h-full justify-end py-8",
          )}
        >
          {text}
        </div>
      ) : (
        <div
          className={cn(
            "relative flex flex-col text-white",
            isFeature ? "gap-3 p-5 md:h-full md:justify-end md:p-8 min-[1200px]:p-12" : "h-full justify-end gap-1.5 p-5 md:p-7",
          )}
        >
          {text}
        </div>
      )}
    </Link>
  );
}
