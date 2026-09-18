import Image from "next/image";
import { Play } from "lucide-react";
import type { HostVideo } from "@/data/host-profiles";
import { getHostVideoThumbnail } from "@/data/host-profiles";
import { formatDuration } from "@/lib/utils/format";

/**
 * A single real video from a host's own YouTube channel — styled like
 * EpisodeCard (same media/hover-zoom language) but linking out to YouTube
 * instead of an internal episode page, since this content lives on the
 * host's channel, not in Waie's own catalog.
 */
export function HostVideoCard({ video }: { video: HostVideo }) {
  return (
    <article className="hover-zoom min-w-0">
      <a
        href={`https://www.youtube.com/watch?v=${video.id}`}
        target="_blank"
        rel="noreferrer"
        className="media relative block aspect-[16/9] min-w-0 overflow-hidden"
      >
        <Image
          src={getHostVideoThumbnail(video.id)}
          alt={video.title}
          fill
          sizes="(max-width: 640px) 78vw, (max-width: 1024px) 45vw, 320px"
          className="object-cover"
        />
        <span className="play-mark">
          <Play size={14} fill="currentColor" />
        </span>
        <span className="glass-dark absolute bottom-3 left-3 z-10 rounded-[var(--radius-pill)] px-2.5 py-1 text-[.68rem] font-bold text-white">
          {formatDuration(video.durationSeconds)}
        </span>
        <span className="glass-dark absolute right-3 top-3 z-10 rounded-[var(--radius-pill)] px-2.5 py-1 text-[.68rem] font-bold text-white">
          {video.pillar}
        </span>
      </a>

      <div className="min-w-0 pt-4">
        <a
          href={`https://www.youtube.com/watch?v=${video.id}`}
          target="_blank"
          rel="noreferrer"
        >
          <h3 className="episode-card__title line-clamp-2">{video.title}</h3>
        </a>
        <p className="meta mt-2">
          <span>{video.views} مشاهدة</span>
        </p>
      </div>
    </article>
  );
}
