import type { Episode } from "@/types/episode";
import type { Host } from "@/types/host";
import { defaultHostIds, hosts } from "@/data/hosts";

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

const hostsById = new Map(hosts.map((host) => [host.id, host]));

/**
 * The single source of truth for "which hosts show up for this episode" —
 * every host-avatar usage across the app (episode cards, the episode hero,
 * the homepage hosts section) should resolve through this rather than
 * reading `episode.hosts` directly, so the show's default lineup and any
 * per-episode override stay consistent everywhere.
 */
export function resolveEpisodeHosts(episode: Pick<Episode, "hosts">): Host[] {
  const ids = episode.hosts && episode.hosts.length > 0 ? episode.hosts : defaultHostIds;
  return ids.map((id) => hostsById.get(id)).filter((host): host is Host => Boolean(host));
}
