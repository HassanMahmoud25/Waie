import Image from "next/image";
import Link from "next/link";
import { Check, Play } from "lucide-react";
import type { Episode } from "@/types/episode";
import { EpisodeMeta } from "./episode-meta";
import { ProgressBar } from "@/components/shared/progress-bar";
import { cn } from "@/lib/utils/cn";

/**
 * A single row in a series' episode list. Unchanged from the site's plain
 * numbered-list layout (see EpisodeMeta / ProgressBar for the watch-state
 * bits, both pre-existing) -- the only addition is `mediaRef`, which
 * SeriesEpisodeList uses to measure this row's thumbnail so the single
 * continuous route path (see `.journey-*` in globals.css) can thread
 * through its middle.
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
        className="hover-zoom group flex min-w-0 items-center gap-5 sm:w-fit"
      >
        <span className="hidden w-10 shrink-0 text-center text-2xl font-black tracking-[-.04em] text-[var(--muted)] sm:block">
          {order}
        </span>

        <div ref={mediaRef} className="media relative aspect-video w-36 shrink-0 overflow-hidden sm:w-44">
          <Image src={episode.thumbnailUrl} alt="" fill sizes="176px" className="object-cover" />
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

        <div className="min-w-0 max-w-xl flex-1">
          <h3 className="episode-card__title mt-0 line-clamp-1">{episode.title}</h3>
          <p className="episode-card__description mt-1 line-clamp-1 sm:line-clamp-2">{episode.description}</p>
          <EpisodeMeta episode={episode} className="meta mt-2" isCompleted={isCompleted} />
          {typeof progressPercent === "number" && progressPercent > 0 && !isCompleted && (
            <ProgressBar percent={progressPercent} tone={isCurrent ? "current" : "default"} />
          )}
        </div>
      </Link>
    </li>
  );
}
