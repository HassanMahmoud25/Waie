import type { Episode } from "@/types/episode";
import type { Series, SeriesWithStats } from "@/types/series";
import type { TopicWithStats } from "@/types/topic";
import type { Collection } from "@/types/collection";
import type { Recommendation } from "@/types/recommendation";
import type { Transcript } from "@/types/transcript";
import type { MindMap } from "@/types/mind-map";
import type { SearchResults } from "@/types/search";

/**
 * The one interface every page/component talks to for content. Everything
 * returns a Promise on purpose: the current implementation
 * (static-content-repository.ts) resolves synchronously over in-memory demo
 * data, but a Prisma-backed implementation can replace it later without
 * touching a single component.
 */
export interface ContentRepository {
  listEpisodes(): Promise<Episode[]>;
  getEpisodeBySlug(slug: string): Promise<Episode | null>;
  listEpisodesBySeries(seriesId: string): Promise<Episode[]>;
  listEpisodesByTopic(topicId: string): Promise<Episode[]>;
  listFeaturedEpisodes(): Promise<Episode[]>;
  listLatestEpisodes(limit?: number): Promise<Episode[]>;
  listPopularEpisodes(limit?: number): Promise<Episode[]>;
  listRelatedEpisodes(episodeId: string, limit?: number): Promise<Episode[]>;
  getAdjacentEpisodes(episodeId: string): Promise<{ previous: Episode | null; next: Episode | null }>;

  listSeries(): Promise<SeriesWithStats[]>;
  getSeriesBySlug(slug: string): Promise<SeriesWithStats | null>;
  getSeriesById(id: string): Promise<Series | null>;

  listTopics(): Promise<TopicWithStats[]>;
  getTopicBySlug(slug: string): Promise<TopicWithStats | null>;

  listCollections(): Promise<Collection[]>;
  getCollectionBySlug(slug: string): Promise<Collection | null>;
  getEpisodesByIds(ids: string[]): Promise<Episode[]>;

  /** Admin-only: every episode regardless of status (drafts/archived included). */
  listAllEpisodes(): Promise<Episode[]>;
  getEpisodeById(id: string): Promise<Episode | null>;
  updateEpisode(
    id: string,
    patch: Partial<Pick<Episode, "title" | "description" | "status">>,
  ): Promise<Episode | null>;

  getRecommendationsByEpisode(episodeId: string): Promise<Recommendation[]>;
  getTranscriptByEpisode(episodeId: string): Promise<Transcript | null>;
  getMindMapByEpisode(episodeId: string): Promise<MindMap | null>;

  search(query: string): Promise<SearchResults>;
}
