import type { Episode, EpisodeJourneySummary } from "@/types/episode";
import type { Series, SeriesWithStats } from "@/types/series";
import type { Topic, TopicWithStats } from "@/types/topic";
import type { Collection } from "@/types/collection";
import type { Recommendation } from "@/types/recommendation";
import type { Transcript } from "@/types/transcript";
import type { MindMap } from "@/types/mind-map";
import type { SearchResults } from "@/types/search";
import type { ContentStatus } from "@/types/content-status";
import type { CursorPage } from "@/lib/pagination";

/**
 * The one interface every page/component talks to for content. Implemented
 * by prisma-content-repository.ts, the sole content source -- keeping
 * components against this interface rather than Prisma types directly means
 * the backing implementation could change without touching a single
 * component.
 */
export interface ContentRepository {
  listEpisodes(): Promise<Episode[]>;
  /** Total published episodes -- a single COUNT, for a hero/stat number. Never use this as a stand-in for a listing. */
  countPublishedEpisodes(): Promise<number>;
  getEpisodeBySlug(slug: string): Promise<Episode | null>;
  /**
   * Every published episode in one series, in full -- used only where the
   * complete series genuinely must be in hand (getAdjacentEpisodes' prev/
   * next lookup below). Never render this as a list the user pages through
   * -- see listEpisodesBySeriesCursor for that.
   */
  listEpisodesBySeries(seriesId: string): Promise<Episode[]>;
  /**
   * One batch of a series' published episodes, cursor-paginated at the
   * database: `take: limit + 1` so an extra row (never returned) reveals
   * whether more exist, with no separate COUNT query. `cursor` is the id of
   * the last episode already loaded -- Prisma resolves that row's own
   * position under this exact orderBy and continues strictly after it, so
   * the same seriesOrder-aware order this series' page has always used
   * (seriesOrder asc, nulls last, then youtubePublishedAt asc, then id asc
   * as a final deterministic tiebreak) is preserved across every batch.
   */
  listEpisodesBySeriesCursor(
    seriesId: string,
    params: { cursor?: string | null; limit?: number },
  ): Promise<CursorPage<Episode>>;
  /**
   * Every episode in a series, but only `id` and `title` -- enough to
   * compute the series' true "N of M episodes" progress and draw the full
   * dot trail (see SeriesJourneyProgress) independent of how many full
   * episode cards (listEpisodesBySeriesCursor) have actually been loaded
   * into the page yet. This is the "lightweight journey metadata, loaded
   * separately from the episode payload" piece -- it can list every episode
   * because it carries none of the heavy fields (thumbnail, description,
   * topics) a rendered card needs.
   */
  listSeriesJourneySummaries(seriesId: string): Promise<EpisodeJourneySummary[]>;
  /**
   * One batch of a topic's published episodes, cursor-paginated at the
   * database exactly like listEpisodesBySeriesCursor -- same `take: limit +
   * 1` / no-COUNT-query approach, same default order as the rest of the app
   * (youtubePublishedAt desc, id desc).
   */
  listEpisodesByTopicCursor(
    topicId: string,
    params: { cursor?: string | null; limit?: number },
  ): Promise<CursorPage<Episode>>;
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
  /**
   * One thumbnail URL per requested series id -- each series' own "cover
   * episode" (its featured episode if it has one, else its most recently
   * published), at most one row per series id rather than the full episode
   * table. A series with no published episodes is simply absent from the
   * result. Backs every "series cover art" lookup (Home's series bento,
   * /series, a series' own detail page, Library's followed-series cards)
   * that previously fetched every episode just to find one thumbnail.
   */
  getSeriesCoverThumbnails(seriesIds: string[]): Promise<Record<string, string>>;
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

  /**
   * Admin-only: every episode regardless of status (drafts/archived
   * included) -- kept only for call sites that need the true complete set
   * (there are none left in the app's own UI; see searchAdminEpisodesCursor
   * for the admin episodes list). Do not add a new UI collection against
   * this.
   */
  listAllEpisodes(): Promise<Episode[]>;
  /** Admin-only: total episodes per status (plus the grand total) -- one GROUP BY, never listAllEpisodes().length, for the admin episodes list's status tab counts. */
  countEpisodesByStatus(): Promise<{ total: number; byStatus: Record<ContentStatus, number> }>;
  /** Admin-only: the `limit` most recently published episodes regardless of status -- for the admin overview's "latest episodes" tile. */
  listRecentEpisodes(limit?: number): Promise<Episode[]>;
  /**
   * Admin-only, cursor-paginated: one batch of episodes matching an optional
   * status and free-text query (title/youtubeTitle/slug/description/
   * youtubeDescription/series title), Arabic-normalized, plus episodeNumber
   * (exact or left-prefix match, e.g. "11" finds 11 and 111 but not 211).
   * The Arabic-normalized match itself still has to run in JS against the
   * status-filtered candidate set (same reasoning, and the same cost, as
   * contentRepository.search() -- see that method's own comment), so this
   * is a filter, not a ranked search: matches stay in chronological order,
   * never reordered by relevance. What changes here is that only `limit`
   * matches (plus their own nextCursor) are ever returned to the caller,
   * not the full matched set -- the matching pass is unavoidably
   * server-side and in-memory, but the client never receives more than one
   * batch. `cursor` is the id of the last matching episode already loaded;
   * it only makes sense paired with the exact same `status`/`query` it was
   * issued under.
   */
  searchAdminEpisodesCursor(params: {
    status?: ContentStatus | null;
    query?: string;
    cursor?: string | null;
    limit?: number;
  }): Promise<CursorPage<Episode>>;
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
