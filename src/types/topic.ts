export type Topic = {
  id: string;
  slug: string;
  title: string;
  description: string;
  /** Accent color used for the topic dot/chip — kept data-driven so editors can add topics freely. */
  color: string;
};

export type TopicWithStats = Topic & {
  episodeCount: number;
  seriesCount: number;
};
