import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";

/*
 * Placeholders that mirror the real components they stand in for, so the swap
 * from skeleton to content doesn't reflow the page.
 *
 * Two rules keep them honest:
 *  - Text is drawn with `SkeletonText`, which takes the *real* text's
 *    typography classes (`episode-card__title`, `text-lg leading-8`, ...) so
 *    each line box has the height the real line will have, at every breakpoint.
 *  - Boxes that don't depend on text (thumbnails, pills, buttons, banners) copy
 *    the real component's aspect ratio, radius, padding and gaps.
 *
 * Each skeleton names the component it mirrors; change one, check the other.
 */

/** One `SkeletonText` line: a bar width, or a bar width plus a class for the line box itself (to drop the line at some breakpoints). */
export type SkeletonLine = string | { bar: string; line?: string };

/**
 * Lines of text as bars. `className` carries the real text's typography (size,
 * line-height, margins), so `lines.length` lines are as tall as that many real lines.
 */
export function SkeletonText({
  lines,
  className,
  barHeight = "h-[.7em]",
  tone,
}: {
  lines: SkeletonLine[];
  className?: string;
  /** Bars are sized in `em` of the line's own font, so a heading's bar scales with the heading. */
  barHeight?: string;
  tone?: "default" | "strong";
}) {
  return (
    <div className={className}>
      {lines.map((entry, index) => {
        const { bar, line } = typeof entry === "string" ? { bar: entry, line: undefined } : entry;
        return (
          <div key={index} className={line}>
            <Skeleton className={cn("inline-block align-middle", barHeight, bar)} tone={tone} />
          </div>
        );
      })}
    </div>
  );
}

/**
 * The `.eyebrow-pill` / `.home-eyebrow` chip. Its height is its text's line box
 * plus padding and border: .72rem x 1.5 + .9rem + 2px = 33.68px by default,
 * `height` for the pills that set a smaller type size.
 */
export function EyebrowPillSkeleton({
  width = "w-24",
  height = "h-[33.68px]",
  tone,
  className,
}: {
  width?: string;
  height?: string;
  tone?: "default" | "strong";
  className?: string;
}) {
  return <Skeleton className={cn("rounded-full", height, width, className)} tone={tone} />;
}

/** The `.meta` row (duration · date) under a card or a title. */
export function MetaRowSkeleton({ className }: { className?: string }) {
  // `.meta` is a flex row; `block` (a utility, so it wins) lets the bars flow inline inside its own line box.
  return (
    <div className={cn("meta block", className)}>
      <Skeleton className="me-3 inline-block h-[.7em] w-14 align-middle" />
      <Skeleton className="inline-block h-[.7em] w-20 align-middle" />
    </div>
  );
}

/**
 * Breadcrumbs (`nav.meta > ol`): one bar per crumb plus a chevron-sized spacer,
 * in a wrapping row with the real 8px gap, so a long trail drops its last crumb
 * onto a second row on phones just like the real one does.
 */
export function BreadcrumbsSkeleton({ crumbs, className }: { crumbs: string[]; className?: string }) {
  return (
    <div className={cn("meta block", className)}>
      <div className="flex flex-wrap items-center gap-2">
        {crumbs.map((width, index) => (
          <div key={index} className="flex h-[1.6em] items-center gap-2">
            <Skeleton className={cn("h-[.7em]", width)} />
            {index < crumbs.length - 1 && <span className="w-[13px]" />}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Intro paragraph under a page title: 2 lines on phones, 1 from `sm` up (collections, search, library). */
export const INTRO_SHORT: SkeletonLine[] = ["w-full sm:w-[92%]", { bar: "w-3/5", line: "sm:hidden" }];
/** The same for the longer series intro: 3 lines on phones, 2 from `sm` up. */
export const INTRO_LONG: SkeletonLine[] = ["w-full", "w-full sm:w-3/5", { bar: "w-2/5", line: "sm:hidden" }];

/**
 * The header stack shared by the list pages: eyebrow pill, h1, intro. Defaults
 * are the h1 scale of collections/series/search; library and topics pass theirs.
 */
export function PageHeaderSkeleton({
  eyebrowWidth = "w-24",
  titleClassName = "mt-4 text-3xl leading-[1.2] md:text-5xl",
  titleBar = "w-44 md:w-72",
  intro,
  introClassName = "mt-4 max-w-xl text-lg leading-8",
}: {
  eyebrowWidth?: string;
  titleClassName?: string;
  titleBar?: string;
  intro: SkeletonLine[];
  introClassName?: string;
}) {
  return (
    <>
      <EyebrowPillSkeleton width={eyebrowWidth} />
      <SkeletonText className={titleClassName} lines={[titleBar]} barHeight="h-[.6em]" />
      <SkeletonText className={introClassName} lines={intro} />
    </>
  );
}

/** `SectionHeading` (eyebrow + h2 in `.section-heading`), as used on the library page. */
export function SectionHeadingSkeleton() {
  return (
    <div className="section-heading">
      <div>
        <SkeletonText className="eyebrow" lines={["w-24"]} />
        {/* `.section-heading h2` supplies the margin and line-height; the utilities match the real h2's size. */}
        <h2 aria-hidden="true" className="text-xl md:text-3xl">
          <Skeleton className="inline-block h-[.6em] w-44 align-middle" />
        </h2>
      </div>
    </div>
  );
}

/** A homepage section's header: `.home-eyebrow` pill, h2, and the "see all" link opposite. */
export function HomeSectionHeadSkeleton({ withLink = true, titleWidth = "w-40" }: { withLink?: boolean; titleWidth?: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <EyebrowPillSkeleton width="w-24" />
        <SkeletonText className="mt-3 text-xl leading-[1.25] sm:text-2xl" lines={[titleWidth]} barHeight="h-[.6em]" />
      </div>
      {withLink && <Skeleton className="h-5 w-24" />}
    </div>
  );
}

/**
 * Mirrors EpisodeCard: 16:9 thumbnail, then series line, 2-line title, 2-line
 * description, meta row. `wideFromLg` is for a card laid out ~640px wide from
 * `lg` up (the prominent related episode), where the real title and
 * description fit on one line each.
 */
export function EpisodeCardSkeleton({ wideFromLg = false }: { wideFromLg?: boolean }) {
  const secondLine = wideFromLg ? "lg:hidden" : undefined;
  return (
    <div>
      <Skeleton className="aspect-[16/9] w-full" />
      <div className="pt-4">
        <SkeletonText className="episode-card__series" lines={["w-28"]} />
        <SkeletonText className="episode-card__title" lines={["w-full", { bar: "w-2/3", line: secondLine }]} />
        <SkeletonText className="episode-card__description" lines={["w-full", { bar: "w-4/5", line: secondLine }]} />
        <MetaRowSkeleton className="mt-3" />
      </div>
    </div>
  );
}

/** The 1 / 2 / 3-column card grid used across the site; `className` sets the gap where a page differs from the default. */
export function EpisodeCardGridSkeleton({ count = 6, className = "gap-8" }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid sm:grid-cols-2 lg:grid-cols-3", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <EpisodeCardSkeleton key={index} />
      ))}
    </div>
  );
}

/** LibraryContent's two sections (saved, finished), each a heading over a card grid. */
export function LibraryContentSkeleton() {
  return (
    <>
      <section className="mt-10">
        <SectionHeadingSkeleton />
        <EpisodeCardGridSkeleton count={3} />
      </section>
      <section className="mt-14">
        <SectionHeadingSkeleton />
        <EpisodeCardGridSkeleton count={3} />
      </section>
    </>
  );
}

/**
 * A `.rail` of EpisodeCards. The rail's tracks only shrink to their real width
 * (230px, or 320px for `wide`) once there are more cards than fit, so `count`
 * defaults to enough to overflow -- fewer would stretch the cards wider than
 * the real ones.
 */
export function RailSkeleton({ count = 8, wide = false, className }: { count?: number; wide?: boolean; className?: string }) {
  return (
    <div className={cn("rail", wide && "rail--wide", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <EpisodeCardSkeleton key={index} />
      ))}
    </div>
  );
}

/**
 * Mirrors EpisodeListItem, the series journey row: an order number from `sm`,
 * a thumbnail stretched to the text block's height (`.media-stretch`), and a
 * title that runs to 2 lines on phones but 1 from `sm` up.
 */
export function EpisodeListItemSkeleton() {
  return (
    <div className="py-6 sm:py-7">
      <div className="flex min-w-0 items-center gap-4 sm:gap-5">
        <div className="hidden w-10 shrink-0 justify-center sm:flex">
          <Skeleton className="h-6 w-5" />
        </div>
        <div className="media-stretch w-[46%] shrink-0 sm:w-44">
          <div aria-hidden="true" className="aspect-video" />
          <Skeleton className="absolute inset-0" />
        </div>
        <div className="flex min-w-0 max-w-xl flex-1 flex-col gap-1">
          <SkeletonText
            className="episode-card__title"
            lines={["w-full sm:w-3/4", { bar: "w-2/3", line: "sm:hidden" }]}
          />
          <SkeletonText className="episode-card__description" lines={["w-4/5"]} />
          <MetaRowSkeleton />
        </div>
      </div>
    </div>
  );
}

/** Mirrors HorizontalEpisodeCard: stacked on phones, a 42% thumbnail beside the text from `sm`. */
export function HorizontalEpisodeCardSkeleton() {
  return (
    <div className="flex min-w-0 flex-col sm:grid sm:grid-cols-[42%_minmax(0,1fr)] sm:gap-4">
      <div className="media-stretch">
        <div aria-hidden="true" className="aspect-video" />
        <Skeleton className="absolute inset-0" />
      </div>
      <div className="flex min-w-0 flex-col pt-3 sm:py-1">
        <SkeletonText className="episode-card__series" lines={["w-24"]} />
        <SkeletonText className="episode-card__title mt-1" lines={["w-full", "w-2/3"]} />
        <SkeletonText className="episode-card__description hidden sm:block" lines={["w-full", "w-4/5"]} />
        <MetaRowSkeleton className="mt-2 sm:mt-auto sm:pt-2" />
      </div>
    </div>
  );
}

/**
 * Mirrors Banner: a full-bleed image tile with its text carried at the bottom.
 * "compact" is the grid tile (collections, the homepage bento); "feature" is
 * the big one, which stacks an image over its text panel below `md` and
 * overlays the text from `md` up, at 16:8 then 21:9.
 */
export function BannerSkeleton({
  size = "compact",
  stretch = false,
  withDescription = false,
  className,
}: {
  size?: "compact" | "feature";
  /** Fill the grid area instead of the size's own aspect ratio (the compact tile beside the feature). */
  stretch?: boolean;
  /** Compact tiles only show a description from `sm` up, and only some callers pass one (collections do, the bento doesn't). */
  withDescription?: boolean;
  className?: string;
}) {
  const isFeature = size === "feature";
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-banner)]",
        isFeature ? "flex flex-col md:block" : "block",
        stretch
          ? "h-full"
          : isFeature
            ? "md:max-[1199px]:aspect-[16/8] min-[1200px]:aspect-[21/9]"
            : "aspect-[4/3] sm:aspect-[16/10]",
        className,
      )}
    >
      <Skeleton
        className={cn(
          "rounded-none",
          isFeature ? "relative aspect-video shrink-0 md:absolute md:inset-0 md:aspect-auto" : "absolute inset-0",
        )}
      />
      <div
        className={cn(
          "relative flex flex-col",
          isFeature
            ? "gap-3 bg-[var(--surface)] p-5 md:h-full md:justify-end md:bg-transparent md:p-8 min-[1200px]:p-12"
            : "h-full justify-end gap-1.5 p-5 md:p-7",
        )}
      >
        <EyebrowPillSkeleton width="w-24" height={isFeature ? "h-[33.2px]" : "h-8"} tone="strong" />
        <SkeletonText
          className={
            isFeature
              ? "text-2xl leading-[1.3] md:text-4xl md:leading-[1.2] min-[1200px]:text-5xl"
              : "text-xl md:text-2xl"
          }
          lines={[isFeature ? "w-2/3 md:w-1/2" : "w-3/5"]}
          barHeight="h-[.6em]"
          tone="strong"
        />
        {isFeature ? (
          <SkeletonText className="max-w-lg text-sm leading-7 md:text-base" lines={["w-full", "w-2/3"]} tone="strong" />
        ) : (
          withDescription && (
            <SkeletonText className="hidden max-w-lg text-sm leading-7 sm:block" lines={["w-full", "w-3/5"]} tone="strong" />
          )
        )}
        <div className="mt-1 flex items-center gap-2">
          <Skeleton className="h-4 w-16" tone="strong" />
          <Skeleton className="h-[38px] w-28 rounded-full" tone="strong" />
        </div>
      </div>
    </div>
  );
}

/** Mirrors SeriesCard: a 16:10 (16:9 from `sm`) cinematic tile with the count pill, title, description and CTA at the bottom. */
export function SeriesCardSkeleton() {
  return (
    <div className="relative aspect-[16/10] min-w-0 overflow-hidden rounded-[var(--radius-banner)] sm:aspect-video">
      <Skeleton className="absolute inset-0 rounded-none" />
      <div className="relative flex h-full flex-col justify-end gap-2.5 p-5 sm:gap-3 sm:p-8">
        <EyebrowPillSkeleton width="w-24" height="h-[32.7px]" tone="strong" />
        <SkeletonText
          className="text-xl leading-[1.25] sm:text-2xl md:text-3xl"
          lines={["w-1/2"]}
          barHeight="h-[.6em]"
          tone="strong"
        />
        <SkeletonText className="hidden max-w-lg text-sm leading-7 sm:block" lines={["w-full", "w-3/5"]} tone="strong" />
        <Skeleton className="mt-1 h-[38px] w-32 rounded-full" tone="strong" />
      </div>
    </div>
  );
}

/** The real topic chips' widths (px, in order), so the skeleton wraps into as many rows as the real 46-chip block does. */
const CHIP_WIDTHS = [
  "w-[92px]",
  "w-[92px]",
  "w-[131px]",
  "w-[86px]",
  "w-[125px]",
  "w-[83px]",
  "w-[134px]",
  "w-[130px]",
  "w-[134px]",
  "w-[131px]",
  "w-[147px]",
  "w-[141px]",
  "w-[118px]",
  "w-[150px]",
  "w-[78px]",
  "w-[121px]",
  "w-[112px]",
  "w-[81px]",
  "w-[80px]",
  "w-[133px]",
  "w-[129px]",
  "w-[168px]",
  "w-[134px]",
  "w-[141px]",
  "w-[120px]",
  "w-[129px]",
  "w-[126px]",
  "w-[113px]",
  "w-[111px]",
  "w-[121px]",
  "w-[115px]",
  "w-[144px]",
  "w-[144px]",
  "w-[148px]",
  "w-[129px]",
  "w-[129px]",
  "w-[94px]",
  "w-[104px]",
  "w-[134px]",
  "w-[173px]",
  "w-[130px]",
  "w-[161px]",
  "w-[131px]",
  "w-[179px]",
  "w-[117px]",
  "w-[144px]",
];

/** A wrapping block of `.chip` topic pills (search page, search modal); `gap` is the real block's (10px on the page, 8px in the modal). */
export function TopicChipsSkeleton({
  count = CHIP_WIDTHS.length,
  gap = "gap-2.5",
  className,
}: {
  count?: number;
  gap?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap", gap, className)}>
      {CHIP_WIDTHS.slice(0, count).map((width, index) => (
        <Skeleton key={index} className={cn("h-[39.3px] rounded-full", width)} />
      ))}
    </div>
  );
}

/**
 * Mirrors EpisodeNotes' header and its panel in the signed-out / no-notes state
 * (the common one): a heading, then an empty-state card holding an icon, two
 * lines of copy and a button. The panel is 280px tall in the real thing.
 */
export function EpisodeNotesSkeleton() {
  return (
    <div>
      <EyebrowPillSkeleton width="w-24" />
      <SkeletonText className="mt-3 text-xl" lines={["w-48"]} barHeight="h-[.6em]" />
      {/* GlassPanel (p-2 / sm:p-3, 1px border) around an `.empty-state` (3.2rem x 1.5rem padding, 1px border). */}
      <Skeleton className="mt-6 rounded-[var(--radius-card)] border border-transparent p-2 sm:p-3">
        <div className="border border-transparent px-6 py-[3.2rem] text-center">
          <Skeleton className="mx-auto mb-3 size-7 rounded-full" tone="strong" />
          <SkeletonText className="" lines={["w-48"]} tone="strong" />
          <SkeletonText
            className="mt-1 text-sm"
            lines={["w-72 max-w-full", { bar: "w-40", line: "sm:hidden" }]}
            tone="strong"
          />
          <Skeleton className="mx-auto mt-4 h-[46px] w-36 rounded-[14px]" tone="strong" />
        </div>
      </Skeleton>
    </div>
  );
}

/** Mirrors one PrevNextNav link: a glass tile with a 16:9 thumbnail (112px on phones, 128px from `sm`) beside a label and a title. */
export function PrevNextTileSkeleton() {
  return (
    <Skeleton className="flex min-w-0 items-center gap-4 rounded-[var(--radius-card)] border border-transparent p-3 sm:p-4">
      <Skeleton className="aspect-video w-28 shrink-0 sm:w-32" tone="strong" />
      <div className="min-w-0 flex-1">
        <SkeletonText className="text-xs" lines={["w-20"]} tone="strong" />
        <SkeletonText className="mt-1" lines={["w-4/5"]} tone="strong" />
      </div>
    </Skeleton>
  );
}

/** Mirrors a RecommendationsPanel card: a 16:10 image over a body with type, a 1-line title, 2-line context and a footer row (418px at desktop). */
export function RecommendationCardSkeleton() {
  return (
    <Skeleton className="flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-transparent">
      <Skeleton className="aspect-[16/10] rounded-none" tone="strong" />
      <div className="recommendation-card__body">
        <SkeletonText className="text-[.72rem]" lines={["w-24"]} tone="strong" />
        <SkeletonText className="recommendation-card__title" lines={["w-4/5"]} tone="strong" />
        <SkeletonText className="recommendation-card__context" lines={["w-full", "w-4/5"]} tone="strong" />
        <div className="recommendation-card__footer">
          <Skeleton className="h-5 w-16 rounded-full" tone="strong" />
          <Skeleton className="h-5 w-24 rounded-full" tone="strong" />
        </div>
      </div>
    </Skeleton>
  );
}
