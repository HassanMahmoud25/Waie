import type { ContentStatus } from "./content-status";
import type { Person } from "./person";

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
   * The people who actually appeared in this episode (see prisma/schema.prisma's
   * EpisodeParticipant), ordered by the admin's own selection order. Empty for
   * every episode until an editor explicitly assigns participants -- there is
   * no default/fallback lineup. Deliberately unrelated to the static Hosts
   * system (data/hosts.ts): a Person here is an episode-specific participant
   * record, not one of the show's three fixed hosts.
   */
  participants: Person[];
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
