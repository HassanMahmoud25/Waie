import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import type { Episode } from "@/types/episode";
import type { Series } from "@/types/series";
import { EpisodeMeta } from "./episode-meta";

/**
 * Landscape row card: thumbnail beside text rather than above it. Used for
 * mobile rail slides and as the "supporting" tile in the related-episodes
 * hierarchy, where a full standard card would be too tall.
 */
export function HorizontalEpisodeCard({
  episode,
  series,
}: {
  episode: Episode;
  series?: Series | null;
}) {
  return (
    <article className="hover-zoom grid min-w-0 grid-cols-[42%_minmax(0,1fr)] gap-4 items-start">
      <Link
        href={`/episodes/${episode.slug}`}
        className="media relative aspect-video min-w-0 self-start overflow-hidden"
      >
        <Image
          src={episode.thumbnailUrl}
          alt=""
          fill
          sizes="42vw"
          className="object-cover"
        />
        <span className="play-mark">
          <Play size={13} fill="currentColor" />
        </span>
      </Link>

      <div className="flex min-w-0 flex-col py-1">
        <p className="episode-card__series">{series?.title ?? "وعي"}</p>
        <Link href={`/episodes/${episode.slug}`}>
          <h3 className="episode-card__title line-clamp-2 text-[.98rem]">
            {episode.title}
          </h3>
        </Link>
        <EpisodeMeta episode={episode} className="meta mt-auto pt-2" />
      </div>
    </article>
  );
}
