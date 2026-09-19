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
      {/* The completed check rides with the date (one nowrap unit) so a narrow row can never strand a lone "· ✓" on its own line. */}
      <span className="inline-flex items-center gap-[0.45rem] whitespace-nowrap">
        <span aria-hidden="true">·</span>
        {formatArabicDate(episode.publishedAt)}
      </span>
    </p>
  );
}
