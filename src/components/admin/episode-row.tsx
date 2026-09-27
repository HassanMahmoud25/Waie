import Link from "next/link";
import { Pencil, Star } from "lucide-react";
import type { Episode } from "@/types/episode";
import { StatusBadge } from "@/components/admin/status-badge";
import { AdminMediaRow } from "@/components/admin/admin-media-row";
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
    <AdminMediaRow
      thumbnailUrl={episode.thumbnailUrl}
      title={episode.title}
      badges={
        <>
          <StatusBadge status={episode.status} />
          {episode.featured && (
            <span className="admin-status admin-status--featured">
              <Star size={11} fill="currentColor" aria-hidden="true" />
              مميّزة
            </span>
          )}
        </>
      }
      meta={
        <>
          {episode.episodeNumber !== null && <span>وعي {episode.episodeNumber}</span>}
          {seriesTitle && <span>{seriesTitle}</span>}
          {showDuration && <span>{formatDuration(episode.durationSeconds)}</span>}
          <span>{formatArabicDate(episode.publishedAt)}</span>
        </>
      }
      action={
        <Link
          href={`/admin/episodes/${episode.id}`}
          className="btn btn-secondary shrink-0"
          aria-label={`تعديل: ${episode.title}`}
        >
          <Pencil size={15} aria-hidden="true" />
          <span>تعديل</span>
        </Link>
      }
    />
  );
}
