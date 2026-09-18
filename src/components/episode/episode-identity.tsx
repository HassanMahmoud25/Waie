import type { Episode } from "@/types/episode";
import type { Series } from "@/types/series";

/** The recurring "series · episode number" line used across every card variant. */
export function EpisodeIdentity({
  episode,
  series,
  className = "episode-card__series",
}: {
  episode: Episode;
  series?: Series | null;
  className?: string;
}) {
  return (
    <p className={className}>
      {episode.episodeNumber !== null ? `وعي ${episode.episodeNumber}` : null}
      {episode.episodeNumber !== null && series ? " · " : null}
      {series ? series.title : null}
    </p>
  );
}
