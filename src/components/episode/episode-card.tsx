import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import type { Episode } from "@/types/episode";
import type { Series } from "@/types/series";
import { formatDuration } from "@/lib/utils/format";
import { EpisodeIdentity } from "./episode-identity";
import { EpisodeMeta } from "./episode-meta";

/** Standard card: the default grid item for rails, topic pages, series grids and related-episode lists. */
export function EpisodeCard({ episode, series }: { episode: Episode; series?: Series | null }) {
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
          sizes="(max-width: 640px) 78vw, (max-width: 1024px) 45vw, 280px"
          className="object-cover"
        />
        <span className="play-mark">
          <Play size={14} fill="currentColor" />
        </span>
        <span className="glass-dark absolute bottom-3 left-3 z-10 rounded-[var(--radius-pill)] px-2.5 py-1 text-[.68rem] font-bold text-white">
          {formatDuration(episode.durationSeconds)}
        </span>
      </Link>

      <div className="min-w-0 pt-4">
        <EpisodeIdentity episode={episode} series={series} />
        <Link href={`/episodes/${episode.slug}`}>
          <h3 className="episode-card__title line-clamp-2">{episode.title}</h3>
        </Link>
        <p className="episode-card__description line-clamp-2">{episode.description}</p>
        <EpisodeMeta episode={episode} className="meta mt-3" />
      </div>
    </article>
  );
}
