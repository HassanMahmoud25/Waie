import { Clock3 } from "lucide-react";
import type { Episode } from "@/types/episode";
import { formatArabicDate, formatDuration } from "@/lib/utils/format";

/** Duration + publish date row, shared by every card and the episode header. */
export function EpisodeMeta({ episode, className = "meta" }: { episode: Episode; className?: string }) {
  return (
    <p className={className}>
      <span className="inline-flex items-center gap-1">
        <Clock3 size={13} aria-hidden="true" />
        {formatDuration(episode.durationSeconds)}
      </span>
      <span className="inline-flex items-center gap-[0.45rem] whitespace-nowrap">
        <span aria-hidden="true">·</span>
        {formatArabicDate(episode.publishedAt)}
      </span>
    </p>
  );
}
