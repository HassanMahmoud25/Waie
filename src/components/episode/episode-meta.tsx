import { CheckCircle2, Clock3 } from "lucide-react";
import type { Episode } from "@/types/episode";
import { formatArabicDate, formatDuration } from "@/lib/utils/format";

/** Duration + publish date row, shared by every card and the episode header. */
export function EpisodeMeta({
  episode,
  className = "meta",
  isCompleted = false,
}: {
  episode: Episode;
  className?: string;
  isCompleted?: boolean;
}) {
  return (
    <p className={className}>
      <span className="inline-flex items-center gap-1">
        <Clock3 size={13} aria-hidden="true" />
        {formatDuration(episode.durationSeconds)}
      </span>
      <span>
        <span aria-hidden="true" className="me-[0.45rem]">
          ·
        </span>
        {formatArabicDate(episode.publishedAt)}
      </span>
      {isCompleted && (
        <span className="inline-flex items-center gap-1 text-[var(--brand)]">
          <span aria-hidden="true" className="me-[0.45rem]">
            ·
          </span>
          <CheckCircle2 size={14} aria-label="تمّت مشاهدتها" />
        </span>
      )}
    </p>
  );
}
