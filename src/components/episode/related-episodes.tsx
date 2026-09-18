import type { Episode } from "@/types/episode";
import type { Series } from "@/types/series";
import { EpisodeCard } from "./episode-card";
import { HorizontalEpisodeCard } from "./horizontal-episode-card";

/** One prominent pick plus supporting picks — never four identical cards. */
export function RelatedEpisodes({
  episodes,
  seriesById,
}: {
  episodes: Episode[];
  seriesById: Map<string, Series>;
}) {
  if (episodes.length === 0) return null;
  const [prominent, ...supporting] = episodes;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_.9fr]">
      <EpisodeCard
        episode={prominent}
        series={seriesById.get(prominent.seriesId) ?? null}
      />
      {supporting.length > 0 && (
        <div className="flex flex-col">
          {supporting.map((episode) => (
            <div
              className="border-b border-[var(--line-soft)] py-5 first:pt-0 last:border-0 last:pb-0"
              key={episode.id}
            >
              <HorizontalEpisodeCard
                episode={episode}
                series={seriesById.get(episode.seriesId) ?? null}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
