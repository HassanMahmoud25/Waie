import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import type { Episode } from "@/types/episode";
import type { Series } from "@/types/series";
import { EpisodeMeta } from "./episode-meta";

/**
 * Compact episode card that adapts to its width: on narrow screens the
 * thumbnail sits above the text (a row would squeeze both into ~140px
 * slivers), and from `sm` up it becomes a landscape row. In row form the
 * thumbnail is stretched to the text block's height (see `.media-stretch`),
 * so the image and the title/description beside it read as one balanced unit
 * rather than a small 16:9 floating next to a taller column of text.
 */
export function HorizontalEpisodeCard({
  episode,
  series,
}: {
  episode: Episode;
  series?: Series | null;
}) {
  return (
    <article className="hover-zoom flex min-w-0 flex-col sm:grid sm:grid-cols-[42%_minmax(0,1fr)] sm:gap-4">
      <Link href={`/episodes/${episode.slug}`} className="media-stretch block">
        <div aria-hidden="true" className="aspect-video" />
        <span className="media">
          <Image
            src={episode.thumbnailUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 220px"
            className="object-cover"
          />
          <span className="play-mark">
            <Play size={13} fill="currentColor" />
          </span>
        </span>
      </Link>

      <div className="flex min-w-0 flex-col pt-3 sm:py-1">
        <p className="episode-card__series">{series?.title ?? "وعي"}</p>
        <Link href={`/episodes/${episode.slug}`}>
          <h3 className="episode-card__title mt-1 line-clamp-2">{episode.title}</h3>
        </Link>
        <div className="hidden sm:block">
          <p className="episode-card__description line-clamp-2">{episode.description}</p>
        </div>
        <EpisodeMeta episode={episode} className="meta mt-2 sm:mt-auto sm:pt-2" />
      </div>
    </article>
  );
}
