import type { ContentRepository } from "./content-repository";
import type { Episode } from "@/types/episode";
import type { Series, SeriesWithStats } from "@/types/series";
import type { Topic, TopicWithStats } from "@/types/topic";
import type { SearchResults } from "@/types/search";

import { episodes as episodeRows, popularEpisodeSlugs, updateEpisodeEditorialFields } from "@/data/episodes";
import { series as seriesRows } from "@/data/series";
import { topics as topicRows } from "@/data/topics";
import { collections as collectionRows } from "@/data/collections";
import { recommendations as recommendationRows } from "@/data/recommendations";
import { transcripts as transcriptRows } from "@/data/transcripts";
import { mindMaps as mindMapRows } from "@/data/mind-maps";

const isPublished = (episode: Episode) => episode.status === "PUBLISHED";
const byPublishedAtDesc = (a: Episode, b: Episode) => b.publishedAt.getTime() - a.publishedAt.getTime();
const byPublishedAtAsc = (a: Episode, b: Episode) => a.publishedAt.getTime() - b.publishedAt.getTime();

function withSeriesStats(target: Series): SeriesWithStats {
  const episodeCount = episodeRows.filter((episode) => episode.seriesId === target.id && isPublished(episode)).length;
  return { ...target, episodeCount };
}

function withTopicStats(target: Topic): TopicWithStats {
  const episodeCount = episodeRows.filter((episode) => episode.topicIds.includes(target.id) && isPublished(episode)).length;
  const seriesCount = seriesRows.filter((s) => s.topicId === target.id).length;
  return { ...target, episodeCount, seriesCount };
}

/**
 * Reads from the static demo content in src/data. This is the only file that
 * imports src/data directly — everything else goes through ContentRepository.
 * Swap this file for a Prisma-backed implementation when a real database is
 * connected; nothing outside lib/repositories needs to change.
 */
export const staticContentRepository: ContentRepository = {
  async listEpisodes() {
    return episodeRows.filter(isPublished);
  },

  async getEpisodeBySlug(slug) {
    return episodeRows.find((episode) => episode.slug === slug && isPublished(episode)) ?? null;
  },

  async listEpisodesBySeries(seriesId) {
    return episodeRows.filter((episode) => episode.seriesId === seriesId && isPublished(episode)).sort(byPublishedAtAsc);
  },

  async listEpisodesByTopic(topicId) {
    return episodeRows
      .filter((episode) => episode.topicIds.includes(topicId) && isPublished(episode))
      .sort(byPublishedAtDesc);
  },

  async listFeaturedEpisodes() {
    return episodeRows.filter((episode) => episode.featured && isPublished(episode)).sort(byPublishedAtDesc);
  },

  async listLatestEpisodes(limit = 6) {
    return episodeRows.filter(isPublished).sort(byPublishedAtDesc).slice(0, limit);
  },

  async listPopularEpisodes(limit = 6) {
    const bySlug = new Map(episodeRows.map((episode) => [episode.slug, episode]));
    return popularEpisodeSlugs
      .map((slug) => bySlug.get(slug))
      .filter((episode): episode is Episode => Boolean(episode) && isPublished(episode!))
      .slice(0, limit);
  },

  async listRelatedEpisodes(episodeId, limit = 3) {
    const source = episodeRows.find((episode) => episode.id === episodeId);
    if (!source) return [];

    const candidates = episodeRows.filter((episode) => episode.id !== episodeId && isPublished(episode));
    const sameSeries = candidates.filter((episode) => episode.seriesId === source.seriesId);
    const sameTopic = candidates.filter(
      (episode) => !sameSeries.includes(episode) && episode.topicIds.some((topicId) => source.topicIds.includes(topicId)),
    );

    return [...sameSeries.sort(byPublishedAtDesc), ...sameTopic.sort(byPublishedAtDesc)].slice(0, limit);
  },

  async getAdjacentEpisodes(episodeId) {
    const source = episodeRows.find((episode) => episode.id === episodeId);
    if (!source) return { previous: null, next: null };

    const seriesEpisodes = episodeRows
      .filter((episode) => episode.seriesId === source.seriesId && isPublished(episode))
      .sort(byPublishedAtAsc);
    const index = seriesEpisodes.findIndex((episode) => episode.id === episodeId);
    if (index === -1) return { previous: null, next: null };

    return {
      previous: seriesEpisodes[index - 1] ?? null,
      next: seriesEpisodes[index + 1] ?? null,
    };
  },

  async listSeries() {
    return seriesRows.map(withSeriesStats);
  },

  async getSeriesBySlug(slug) {
    const found = seriesRows.find((s) => s.slug === slug);
    return found ? withSeriesStats(found) : null;
  },

  async getSeriesById(id) {
    return seriesRows.find((s) => s.id === id) ?? null;
  },

  async listTopics() {
    return topicRows.map(withTopicStats);
  },

  async getTopicBySlug(slug) {
    const found = topicRows.find((topic) => topic.slug === slug);
    return found ? withTopicStats(found) : null;
  },

  async listCollections() {
    return collectionRows;
  },

  async getCollectionBySlug(slug) {
    return collectionRows.find((collection) => collection.slug === slug) ?? null;
  },

  async getRecommendationsByEpisode(episodeId) {
    return recommendationRows.filter((rec) => rec.episodeId === episodeId).sort((a, b) => a.order - b.order);
  },

  async getTranscriptByEpisode(episodeId) {
    return transcriptRows.find((transcript) => transcript.episodeId === episodeId) ?? null;
  },

  async getMindMapByEpisode(episodeId) {
    return mindMapRows.find((mindMap) => mindMap.episodeId === episodeId) ?? null;
  },

  async search(query) {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return { episodes: [], series: [], topics: [] } satisfies SearchResults;
    }

    const matches = (...values: Array<string | undefined>) =>
      values.some((value) => value?.toLowerCase().includes(normalized));

    const matchedEpisodes = episodeRows
      .filter((episode) => isPublished(episode) && matches(episode.title, episode.description))
      .sort(byPublishedAtDesc);

    const matchedSeries = seriesRows.filter((s) => matches(s.title, s.description));
    const matchedTopics = topicRows.filter((topic) => matches(topic.title, topic.description));

    return { episodes: matchedEpisodes, series: matchedSeries, topics: matchedTopics } satisfies SearchResults;
  },

  async getEpisodesByIds(ids) {
    const byId = new Map(episodeRows.map((episode) => [episode.id, episode]));
    return ids.map((id) => byId.get(id)).filter((episode): episode is Episode => Boolean(episode));
  },

  async listAllEpisodes() {
    return [...episodeRows].sort(byPublishedAtDesc);
  },

  async getEpisodeById(id) {
    return episodeRows.find((episode) => episode.id === id) ?? null;
  },

  async updateEpisode(id, patch) {
    return updateEpisodeEditorialFields(id, patch);
  },
};
