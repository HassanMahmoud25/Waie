import Image from "next/image";
import Link from "next/link";
import { Pencil, Star } from "lucide-react";
import type { Episode } from "@/types/episode";
import { StatusBadge } from "@/components/admin/status-badge";
import { formatArabicDate, formatDuration } from "@/lib/utils/format";

/**
 * One episode in an admin list: thumbnail, status, title, meta, edit action.
 * Shared by the overview's "latest episodes" and the full episodes list so a
 * row looks the same wherever it appears. `seriesTitle` / `showDuration` add
 * the extra columns the full list needs.
 */
export function EpisodeRow({
  episode,
  seriesTitle,
  showDuration = false,
}: {
  episode: Episode;
  seriesTitle?: string;
  showDuration?: boolean;
}) {
  return (
    <div className="admin-row">
      <div className="admin-thumb">
        {episode.thumbnailUrl && (
          <Image src={episode.thumbnailUrl} alt="" fill sizes="128px" className="object-cover" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge status={episode.status} />
          {episode.featured && (
            <span className="admin-status admin-status--featured">
              <Star size={11} fill="currentColor" aria-hidden="true" />
              مميّزة
            </span>
          )}
        </div>
        <p className="admin-row__title">{episode.title}</p>
        <p className="meta mt-1">
          {episode.episodeNumber !== null && <span>وعي {episode.episodeNumber}</span>}
          {seriesTitle && <span>{seriesTitle}</span>}
          {showDuration && <span>{formatDuration(episode.durationSeconds)}</span>}
          <span>{formatArabicDate(episode.publishedAt)}</span>
        </p>
      </div>

      <Link
        href={`/admin/episodes/${episode.id}`}
        className="btn btn-secondary shrink-0 max-sm:size-11 max-sm:min-h-0 max-sm:rounded-full max-sm:p-0"
        aria-label={`تعديل: ${episode.title}`}
      >
        <Pencil size={15} aria-hidden="true" />
        <span className="max-sm:hidden">تعديل</span>
      </Link>
    </div>
  );
}
