import type { ContentStatus } from "./content-status";
import type { Series } from "./series";

export type Episode = {
  id: string;
  slug: string;
  title: string;
  description: string;
  youtubeVideoId: string;
  thumbnailUrl: string;
  /**
   * Direct URL of an audio file Waie itself owns/hosts for this episode (its own
   * podcast feed, CDN, ...). Editorial-only: never derived from, downloaded from
   * or proxied through YouTube. When set, the episode player uses a real HTML5
   * audio element, which is what makes background playback and the OS
   * lock-screen controls possible; when absent, the YouTube embed is used and
   * the browser/YouTube decide what happens in the background.
   */
  audioUrl?: string | null;
  /** Editorial-only numbering (Waie's own "وعي N" scheme) -- null until an editor sets it; never inferred from YouTube. */
  episodeNumber: number | null;
  durationSeconds: number;
  publishedAt: Date;
  status: ContentStatus;
  featured: boolean;
  seriesId: string;
  topicIds: string[];
  /**
   * Host ids (see data/hosts.ts) who actually appear in this episode.
   * Optional/undefined — not "no hosts" — meaning "use the show's default
   * lineup" (see resolveEpisodeHosts in lib/utils/content.ts). Set this
   * explicitly per episode once real per-episode lineups are known (a solo
   * episode, a guest takeover, etc.).
   */
  hosts?: string[];
};

/** Episode enriched with its resolved series — used wherever a card needs the series title. */
export type EpisodeWithSeries = Episode & {
  series: Series | null;
};

/**
 * Just enough to compute a series' overall progress (the "N of M episodes"
 * stat and dot trail in SeriesJourneyProgress) without the full episode
 * payload -- see ContentRepository.listSeriesJourneySummaries. Deliberately
 * excludes thumbnailUrl/description/etc: this represents *every* episode in
 * a series (which can be large), so it stays cheap regardless of how many
 * of those episodes have their full card data loaded into the page yet.
 */
export type EpisodeJourneySummary = {
  id: string;
  title: string;
};
