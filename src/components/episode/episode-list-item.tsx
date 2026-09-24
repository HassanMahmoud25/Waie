import Link from "next/link";
import { Check, Play } from "lucide-react";
import type { Episode } from "@/types/episode";
import { EpisodeMeta } from "./episode-meta";
import { ProgressBar } from "@/components/shared/progress-bar";
import { cn } from "@/lib/utils/cn";
import { EpisodeThumbnail } from "@/components/content/episode-thumbnail";

/**
 * A single row in a series' episode list. `mediaRef` is how SeriesEpisodeList
 * measures this row's thumbnail so the single continuous route path (see
 * `.journey-*` in globals.css) can thread through its middle.
 *
 * It stays a row on mobile (unlike the stacked library/related cards): the
 * route runs *behind* each thumbnail and only shows in the gaps between
 * rows, so stacking the text under a full-width image would put the route
 * line straight through the text. Instead the thumbnail takes a proportional
 * share of the row and is stretched to the text block's height
 * (`.media-stretch`), so image and text stay visually matched.
 */
export function EpisodeListItem({
  episode,
  order,
  isCompleted = false,
  /** True for the one episode SeriesEpisodeList has picked as "watching now" -- the episode with the most recent, unfinished progress in this series. */
  isCurrent = false,
  progressPercent,
  mediaRef,
}: {
  episode: Episode;
  order: number;
  isCompleted?: boolean;
  isCurrent?: boolean;
  progressPercent?: number;
  mediaRef?: (el: HTMLDivElement | null) => void;
}) {
  return (
    <li
      className={cn(
        "journey-list-item py-6 sm:py-7",
        isCompleted && "journey-list-item--completed",
        isCurrent && "journey-list-item--current",
      )}
    >
      <Link
        href={`/episodes/${episode.slug}`}
        className="hover-zoom group flex min-w-0 items-center gap-4 sm:w-fit sm:gap-5"
      >
        <span className="hidden w-10 shrink-0 text-center text-2xl font-black tracking-[-.04em] text-[var(--muted)] sm:block">
          {order}
        </span>

        <div className="media-stretch w-[46%] shrink-0 sm:w-44">
          <div aria-hidden="true" className="aspect-video" />
          <div ref={mediaRef} className="media">
            <EpisodeThumbnail src={episode.thumbnailUrl} alt="" fill sizes="(max-width: 640px) 46vw, 176px" className="object-cover" />
            <span className="play-mark">
              <Play size={13} fill="currentColor" />
            </span>
            {isCompleted ? (
              <span className="journey-episode-badge journey-episode-badge--completed" aria-hidden="true">
                <Check size={13} strokeWidth={3} />
              </span>
            ) : (
              isCurrent && (
                <span className="journey-episode-badge journey-episode-badge--current" aria-hidden="true">
                  <Play size={10} fill="currentColor" />
                </span>
              )
            )}
          </div>
        </div>

        <div className="min-w-0 max-w-xl flex flex-col gap-1">
          <h3 className="episode-card__title line-clamp-2 sm:line-clamp-1">{episode.title}</h3>
          <p className="episode-card__description line-clamp-1 sm:line-clamp-2">{episode.description}</p>
          <EpisodeMeta episode={episode} className="meta" isCompleted={isCompleted} />
          {typeof progressPercent === "number" && progressPercent > 0 && !isCompleted && (
            <ProgressBar percent={progressPercent} tone={isCurrent ? "current" : "default"} />
          )}
        </div>
      </Link>
    </li>
  );
}
