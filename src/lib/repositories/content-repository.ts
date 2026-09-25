import type { Episode } from "@/types/episode";
import type { Series, SeriesWithStats } from "@/types/series";
import type { Topic, TopicWithStats } from "@/types/topic";
import type { Collection } from "@/types/collection";
import type { Recommendation } from "@/types/recommendation";
import type { Transcript } from "@/types/transcript";
import type { MindMap } from "@/types/mind-map";
import type { SearchResults } from "@/types/search";
import type { ContentStatus } from "@/types/content-status";

/**
 * The one interface every page/component talks to for content. Implemented
 * by prisma-content-repository.ts, the sole content source -- keeping
 * components against this interface rather than Prisma types directly means
 * the backing implementation could change without touching a single
 * component.
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
  /** Targeted batch lookup (no stats) -- for resolving a handful of series by id, e.g. an episode's own series plus its related episodes', without loading the whole table. */
  getSeriesByIds(ids: string[]): Promise<Series[]>;
  /** Admin-only: every series regardless of status (drafts/archived included). Mirrors listAllEpisodes. */
  listAllSeries(): Promise<SeriesWithStats[]>;

  listTopics(): Promise<TopicWithStats[]>;
  getTopicBySlug(slug: string): Promise<TopicWithStats | null>;
  /** Targeted batch lookup (no stats) -- mirrors getSeriesByIds. */
  getTopicsByIds(ids: string[]): Promise<Topic[]>;

  listCollections(): Promise<Collection[]>;
  getCollectionBySlug(slug: string): Promise<Collection | null>;
  /** Admin-only: every collection regardless of status. Mirrors listAllEpisodes. */
  listAllCollections(): Promise<Collection[]>;
  getEpisodesByIds(ids: string[]): Promise<Episode[]>;

  /** Admin-only: every episode regardless of status (drafts/archived included). */
  listAllEpisodes(): Promise<Episode[]>;
  /** Admin-only: episodes matching an optional status and free-text query (title/slug/description/episode number). Empty/omitted query behaves like listAllEpisodes() filtered by status. */
  searchAdminEpisodes(params: { status?: ContentStatus | null; query?: string }): Promise<Episode[]>;
  getEpisodeById(id: string): Promise<Episode | null>;
  updateEpisode(
    id: string,
    patch: Partial<Pick<Episode, "title" | "description" | "status" | "audioUrl">>,
  ): Promise<Episode | null>;

  getRecommendationsByEpisode(episodeId: string): Promise<Recommendation[]>;
  getTranscriptByEpisode(episodeId: string): Promise<Transcript | null>;
  getMindMapByEpisode(episodeId: string): Promise<MindMap | null>;

  search(query: string): Promise<SearchResults>;
}
