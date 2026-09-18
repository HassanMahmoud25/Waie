import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Play } from "lucide-react";
import type { Episode } from "@/types/episode";
import type { Series } from "@/types/series";
import { formatDuration } from "@/lib/utils/format";
import { EpisodeIdentity } from "@/components/episode/episode-identity";

/**
 * Homepage "continue watching" tile: EpisodeCard's thumbnail/typography, plus
 * an always-visible progress fill along the thumbnail's bottom edge and a
 * remaining-time chip in place of the usual total-duration chip, so the
 * card reads as "pick up where you left off" rather than a generic listing.
 */
export function ContinueWatchingCard({
  episode,
  series,
  percent,
  remainingSeconds,
}: {
  episode: Episode;
  series?: Series | null;
  /** 0-100, how much of the episode has been watched. */
  percent: number;
  remainingSeconds: number;
}) {
  const clampedPercent = Math.min(99, Math.max(1, Math.round(percent)));
  const remainingLabel =
    remainingSeconds > 60 ? `تبقّى ${formatDuration(remainingSeconds)}` : "على وشك الانتهاء";

  return (
    <article className="hover-zoom min-w-0">
      <Link
        href={`/episodes/${episode.slug}`}
        className="media relative block aspect-[16/9] min-w-0 overflow-hidden"
      >
        <Image
          src={episode.thumbnailUrl}
          alt={episode.title}
          fill
          sizes="(max-width: 640px) 88vw, (max-width: 1024px) 45vw, 380px"
          className="object-cover"
        />
        <span className="play-mark">
          <Play size={14} fill="currentColor" />
        </span>
        <span className="glass-dark absolute bottom-3 left-3 z-10 rounded-[var(--radius-pill)] px-2.5 py-1 text-[.68rem] font-bold text-white">
          {remainingLabel}
        </span>
        <span
          className="continue-progress"
          role="progressbar"
          aria-label={`${episode.title}: نسبة المشاهدة`}
          aria-valuenow={clampedPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span className="continue-progress__fill" style={{ width: `${clampedPercent}%` }} />
        </span>
      </Link>

      <div className="min-w-0 pt-4">
        <EpisodeIdentity episode={episode} series={series} />
        <Link href={`/episodes/${episode.slug}`}>
          <h3 className="episode-card__title line-clamp-2">{episode.title}</h3>
        </Link>
        <Link href={`/episodes/${episode.slug}`} className="continue-cta">
          متابعة المشاهدة
          <ArrowLeft size={15} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
