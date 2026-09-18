import type { ContentStatus } from "./content-status";

export type Series = {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImage?: string;
  /** Portrait crop of coverImage for narrow viewports; falls back to coverImage when unset. */
  coverImageMobile?: string;
  /** Null until an editor assigns a topic -- never inferred from a YouTube playlist. */
  topicId: string | null;
  status: ContentStatus;
};

/** episodeCount is derived by the repository (a join), never stored redundantly. */
export type SeriesWithStats = Series & {
  episodeCount: number;
};
