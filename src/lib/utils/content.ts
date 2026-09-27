import type { Episode } from "@/types/episode";

/**
 * Series and collections have no dedicated cover-art field — the show's own
 * episode thumbnails are its imagery (the same principle streaming/editorial
 * platforms use: a title's artwork is a still from the content itself).
 * Prefers a featured episode, falling back to the most recently published.
 */
export function findSeriesCoverEpisode(episodes: Episode[], seriesId: string): Episode | undefined {
  const inSeries = episodes.filter((episode) => episode.seriesId === seriesId);
  const featured = inSeries.find((episode) => episode.featured);
  if (featured) return featured;
  return [...inSeries].sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())[0];
}
