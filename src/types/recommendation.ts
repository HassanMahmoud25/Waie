export type RecommendationType =
  // Platforms a host/guest points to directly — the common case for the
  // "التوصيات" tab: a specific video, track, or post mentioned in-episode.
  | "YOUTUBE"
  | "SOUNDCLOUD"
  | "PODCAST"
  | "FACEBOOK"
  | "INSTAGRAM"
  | "BOOK"
  | "WEBSITE"
  | "EXTERNAL"
  // Legacy values already stored in the database (see prisma/schema.prisma)
  // from before the tab's redesign -- kept so old rows still render.
  | "MOVIE"
  | "PERSON"
  | "PRODUCT"
  | "STUDY"
  | "REFERENCE";

/** Something a host/guest mentioned in an episode — shown in the "التوصيات" tab. */
export type Recommendation = {
  id: string;
  episodeId: string;
  type: RecommendationType;
  title: string;
  description: string;
  /** Why it was mentioned — the editorial value-add over a plain link list. */
  reason: string;
  imageUrl?: string;
  url?: string;
  timestampSeconds?: number;
  order: number;
  /** Display name of the source, e.g. "BBC Arabic", "قناة حازم الصديق" — distinct from the platform-derived label/icon. */
  source?: string;
  /** Mainly for BOOK; kept generic enough for a byline on an article too. */
  author?: string;
  /** Small extra facts worth a mention (e.g. duration, published date) — rendered lightweight, never assumed present. */
  metadata?: Record<string, string>;
};
