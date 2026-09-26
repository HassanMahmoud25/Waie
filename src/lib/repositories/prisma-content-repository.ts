import type {
  Episode as PrismaEpisode,
  EpisodeTopic as PrismaEpisodeTopic,
  Series as PrismaSeries,
  Topic as PrismaTopic,
  Collection as PrismaCollection,
  CollectionItem as PrismaCollectionItem,
  Recommendation as PrismaRecommendation,
  Transcript as PrismaTranscript,
  MindMap as PrismaMindMap,
} from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import type { ContentRepository } from "./content-repository";
import type { Episode } from "@/types/episode";
import type { Series, SeriesWithStats } from "@/types/series";
import type { Topic, TopicWithStats } from "@/types/topic";
import type { Collection } from "@/types/collection";
import type { Recommendation } from "@/types/recommendation";
import type { Transcript } from "@/types/transcript";
import type { MindMap, MindMapNode } from "@/types/mind-map";
import type { SearchResults } from "@/types/search";
import { normalizeSearchText } from "@/lib/search/normalize";
import { SCORE, extractNumberToken, matchesAdminEpisodeQuery, scoreContains, scoreEpisodeNumber, scoreTitle } from "@/lib/search/rank";

// ---------------------------------------------------------------------------
// Mapping: Prisma rows (with the YouTube-owned/editorial split) -> the app's
// plain content types. This coalescing is the one place "which value wins"
// is decided: an editorial override always wins over the YouTube original,
// and falls back to it only when no override has ever been set.
// ---------------------------------------------------------------------------

type EpisodeRow = PrismaEpisode & { topics: PrismaEpisodeTopic[] };

function toEpisode(row: EpisodeRow): Episode {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title ?? row.youtubeTitle,
    description: row.description ?? row.youtubeDescription ?? "",
    youtubeVideoId: row.youtubeVideoId,
    thumbnailUrl: row.thumbnailUrl ?? row.youtubeThumbnailUrl,
    audioUrl: row.audioUrl,
    episodeNumber: row.episodeNumber,
    durationSeconds: row.youtubeDurationSeconds,
    publishedAt: row.youtubePublishedAt,
    status: row.status,
    featured: row.featured,
    seriesId: row.seriesId ?? "",
    topicIds: row.topics.map((topic) => topic.topicId),
  };
}

function toSeries(row: PrismaSeries): Series {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? "",
    coverImage: row.coverImage ?? undefined,
    coverImageMobile: row.coverImageMobile ?? undefined,
    topicId: row.topicId,
    status: row.status,
  };
}

function toTopic(row: PrismaTopic): Topic {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? "",
    color: row.color ?? "var(--accent)",
  };
}

function toCollection(row: PrismaCollection & { items: PrismaCollectionItem[] }): Collection {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? "",
    episodeIds: [...row.items].sort((a, b) => a.position - b.position).map((item) => item.episodeId),
  };
}

function toRecommendation(row: PrismaRecommendation): Recommendation {
  return {
    id: row.id,
    episodeId: row.episodeId,
    type: row.type,
    title: row.title,
    description: row.description ?? "",
    reason: row.reason ?? "",
    imageUrl: row.imageUrl ?? undefined,
    url: row.url ?? undefined,
    timestampSeconds: row.timestampSeconds ?? undefined,
    order: row.order,
  };
}

function toTranscript(row: PrismaTranscript): Transcript {
  return {
    id: row.id,
    episodeId: row.episodeId,
    language: row.language,
    text: row.text,
  };
}

function toMindMap(row: PrismaMindMap): MindMap {
  return {
    id: row.id,
    episodeId: row.episodeId,
    title: row.title,
    root: row.nodes as unknown as MindMapNode,
  };
}

const episodeInclude = { topics: true } as const;
const isPublishedWhere = { status: "PUBLISHED" as const };

async function publishedEpisodeCounts(): Promise<Map<string, number>> {
  const rows = await prisma.episode.groupBy({
    by: ["seriesId"],
    where: { status: "PUBLISHED", seriesId: { not: null } },
    _count: { _all: true },
  });
  return new Map(rows.map((row) => [row.seriesId as string, row._count._all]));
}

/**
 * Prisma-backed ContentRepository -- the app's only content source, exported
 * as `contentRepository` from lib/repositories/index.ts. Every page/component
 * keeps talking to the same ContentRepository interface, so nothing outside
 * this file and index.ts needs to know a real database exists.
 */
export const prismaContentRepository: ContentRepository = {
  async listEpisodes() {
    const rows = await prisma.episode.findMany({
      where: isPublishedWhere,
      include: episodeInclude,
      orderBy: { youtubePublishedAt: "desc" },
    });
    return rows.map(toEpisode);
  },

  async getEpisodeBySlug(slug) {
    const row = await prisma.episode.findFirst({
      where: { slug, ...isPublishedWhere },
      include: episodeInclude,
    });
    return row ? toEpisode(row) : null;
  },

  async listEpisodesBySeries(seriesId) {
    const rows = await prisma.episode.findMany({
      where: { seriesId, ...isPublishedWhere },
      include: episodeInclude,
    });
    // Editorial seriesOrder wins when set (an admin has manually ordered
    // this series); otherwise fall back to chronological -- the order
    // episodes were actually published in.
    const sorted = [...rows].sort((a, b) => {
      if (a.seriesOrder != null && b.seriesOrder != null && a.seriesOrder !== b.seriesOrder) {
        return a.seriesOrder - b.seriesOrder;
      }
      if (a.seriesOrder != null && b.seriesOrder == null) return -1;
      if (a.seriesOrder == null && b.seriesOrder != null) return 1;
      return a.youtubePublishedAt.getTime() - b.youtubePublishedAt.getTime();
    });
    return sorted.map(toEpisode);
  },

  async listEpisodesByTopic(topicId) {
    const rows = await prisma.episode.findMany({
      where: { ...isPublishedWhere, topics: { some: { topicId } } },
      include: episodeInclude,
      orderBy: { youtubePublishedAt: "desc" },
    });
    return rows.map(toEpisode);
  },

  async listFeaturedEpisodes() {
    const rows = await prisma.episode.findMany({
      where: { ...isPublishedWhere, featured: true },
      include: episodeInclude,
      orderBy: { youtubePublishedAt: "desc" },
    });
    return rows.map(toEpisode);
  },

  async listLatestEpisodes(limit = 6) {
    const rows = await prisma.episode.findMany({
      where: isPublishedWhere,
      include: episodeInclude,
      orderBy: { youtubePublishedAt: "desc" },
      take: limit,
    });
    return rows.map(toEpisode);
  },

  async listPopularEpisodes(limit = 6) {
    // Real engagement signal (saves), not a fabricated ranking. Backfilled
    // with recent episodes when there isn't yet enough save activity --
    // e.g. right after a fresh import, before any user has saved anything.
    const savedCounts = await prisma.savedEpisode.groupBy({
      by: ["episodeId"],
      _count: { _all: true },
      orderBy: { _count: { episodeId: "desc" } },
      take: limit,
    });

    const rankedIds = savedCounts.map((row) => row.episodeId);
    const rankedRows = rankedIds.length
      ? await prisma.episode.findMany({ where: { id: { in: rankedIds }, ...isPublishedWhere }, include: episodeInclude })
      : [];
    const rankedById = new Map(rankedRows.map((row) => [row.id, row]));
    const ranked = rankedIds.map((id) => rankedById.get(id)).filter((row): row is EpisodeRow => Boolean(row));

    if (ranked.length >= limit) return ranked.slice(0, limit).map(toEpisode);

    const fillRows = await prisma.episode.findMany({
      where: { ...isPublishedWhere, id: { notIn: ranked.map((row) => row.id) } },
      include: episodeInclude,
      orderBy: { youtubePublishedAt: "desc" },
      take: limit - ranked.length,
    });

    return [...ranked, ...fillRows].map(toEpisode);
  },

  async listRelatedEpisodes(episodeId, limit = 3) {
    const source = await prisma.episode.findUnique({ where: { id: episodeId }, include: episodeInclude });
    if (!source) return [];

    const sourceTopicIds = source.topics.map((topic) => topic.topicId);

    const sameSeries = source.seriesId
      ? await prisma.episode.findMany({
          where: { seriesId: source.seriesId, id: { not: episodeId }, ...isPublishedWhere },
          include: episodeInclude,
          orderBy: { youtubePublishedAt: "desc" },
        })
      : [];

    const remaining = limit - sameSeries.length;
    const sameTopic =
      remaining > 0 && sourceTopicIds.length > 0
        ? await prisma.episode.findMany({
            where: {
              id: { not: episodeId, notIn: sameSeries.map((row) => row.id) },
              ...isPublishedWhere,
              topics: { some: { topicId: { in: sourceTopicIds } } },
            },
            include: episodeInclude,
            orderBy: { youtubePublishedAt: "desc" },
          })
        : [];

    return [...sameSeries, ...sameTopic].slice(0, limit).map(toEpisode);
  },

  async getAdjacentEpisodes(episodeId) {
    const source = await prisma.episode.findUnique({ where: { id: episodeId } });
    if (!source?.seriesId) return { previous: null, next: null };

    const seriesEpisodes = await this.listEpisodesBySeries(source.seriesId);
    const index = seriesEpisodes.findIndex((episode) => episode.id === episodeId);
    if (index === -1) return { previous: null, next: null };

    return {
      previous: seriesEpisodes[index - 1] ?? null,
      next: seriesEpisodes[index + 1] ?? null,
    };
  },

  async listSeries() {
    const [rows, counts] = await Promise.all([
      prisma.series.findMany({ where: isPublishedWhere }),
      publishedEpisodeCounts(),
    ]);
    return rows.map((row) => ({ ...toSeries(row), episodeCount: counts.get(row.id) ?? 0 }));
  },

  async getSeriesBySlug(slug) {
    const row = await prisma.series.findFirst({ where: { slug, ...isPublishedWhere } });
    if (!row) return null;
    const count = await prisma.episode.count({ where: { seriesId: row.id, ...isPublishedWhere } });
    return { ...toSeries(row), episodeCount: count } satisfies SeriesWithStats;
  },

  async getSeriesById(id) {
    const row = await prisma.series.findUnique({ where: { id } });
    return row ? toSeries(row) : null;
  },

  async getSeriesByIds(ids) {
    if (ids.length === 0) return [];
    const rows = await prisma.series.findMany({ where: { id: { in: ids } } });
    return rows.map(toSeries);
  },

  /** Admin-only: every series regardless of status -- used by /admin pages so a draft series never silently disappears from their own list. */
  async listAllSeries() {
    const [rows, counts] = await Promise.all([prisma.series.findMany(), publishedEpisodeCounts()]);
    return rows.map((row) => ({ ...toSeries(row), episodeCount: counts.get(row.id) ?? 0 }));
  },

  async listTopics() {
    const [rows, episodeCounts, seriesCounts] = await Promise.all([
      prisma.topic.findMany(),
      prisma.episodeTopic.groupBy({ by: ["topicId"], _count: { _all: true } }),
      prisma.series.groupBy({ by: ["topicId"], where: { topicId: { not: null } }, _count: { _all: true } }),
    ]);
    const episodeCountByTopic = new Map(episodeCounts.map((row) => [row.topicId, row._count._all]));
    const seriesCountByTopic = new Map(seriesCounts.map((row) => [row.topicId as string, row._count._all]));

    return rows.map(
      (row): TopicWithStats => ({
        ...toTopic(row),
        episodeCount: episodeCountByTopic.get(row.id) ?? 0,
        seriesCount: seriesCountByTopic.get(row.id) ?? 0,
      }),
    );
  },

  async getTopicBySlug(slug) {
    const row = await prisma.topic.findUnique({ where: { slug } });
    if (!row) return null;
    const [episodeCount, seriesCount] = await Promise.all([
      prisma.episodeTopic.count({ where: { topicId: row.id } }),
      prisma.series.count({ where: { topicId: row.id } }),
    ]);
    return { ...toTopic(row), episodeCount, seriesCount } satisfies TopicWithStats;
  },

  async getTopicsByIds(ids) {
    if (ids.length === 0) return [];
    const rows = await prisma.topic.findMany({ where: { id: { in: ids } } });
    return rows.map(toTopic);
  },

  async listCollections() {
    const rows = await prisma.collection.findMany({ where: isPublishedWhere, include: { items: true } });
    return rows.map(toCollection);
  },

  async getCollectionBySlug(slug) {
    const row = await prisma.collection.findFirst({ where: { slug, ...isPublishedWhere }, include: { items: true } });
    return row ? toCollection(row) : null;
  },

  /** Admin-only: every collection regardless of status. */
  async listAllCollections() {
    const rows = await prisma.collection.findMany({ include: { items: true } });
    return rows.map(toCollection);
  },

  async getEpisodesByIds(ids) {
    if (ids.length === 0) return [];
    // Public-facing (see (site)/collections/**): a collection referencing a
    // since-unpublished episode must not leak it here.
    const rows = await prisma.episode.findMany({ where: { id: { in: ids }, ...isPublishedWhere }, include: episodeInclude });
    const byId = new Map(rows.map((row) => [row.id, row]));
    return ids.map((id) => byId.get(id)).filter((row): row is EpisodeRow => Boolean(row)).map(toEpisode);
  },

  async listAllEpisodes() {
    const rows = await prisma.episode.findMany({ include: episodeInclude, orderBy: { youtubePublishedAt: "desc" } });
    return rows.map(toEpisode);
  },

  async searchAdminEpisodes({ status, query }) {
    // status stays a real Prisma `where` (cheap exact-enum equality, already
    // covered by @@index([status, youtubePublishedAt])); the free-text query
    // can't be, since Arabic-Indic digit/diacritic/letter-variant
    // normalization has no plain-ILIKE equivalent -- so it's matched in JS
    // against this already-bounded, status-filtered set (see search() above
    // for the identical reasoning on the public side). Deliberately a filter,
    // not a ranked search: this is a lookup tool for finding one specific
    // episode to edit, so matches stay in the same chronological order the
    // rest of the admin list already uses, never reordered by relevance.
    const rows = await prisma.episode.findMany({
      where: status ? { status } : {},
      include: episodeInclude,
      orderBy: { youtubePublishedAt: "desc" },
    });

    const trimmed = query?.trim() ?? "";
    if (!trimmed) return rows.map(toEpisode);

    const normalizedQuery = normalizeSearchText(trimmed);
    const numberToken = extractNumberToken(trimmed);
    if (!normalizedQuery && !numberToken) return [];

    // Lean, admin-scoped (not published-only) id -> title lookup -- mirrors
    // listAllSeries()'s "admin sees draft series titles too" behavior, minus
    // the episode-count stats that method computes and search doesn't need.
    const seriesRows = await prisma.series.findMany({ select: { id: true, title: true } });
    const seriesTitleById = new Map(seriesRows.map((row) => [row.id, row.title]));

    const matchesQuery = (row: EpisodeRow) => {
      const seriesTitle = row.seriesId ? seriesTitleById.get(row.seriesId) : undefined;
      return matchesAdminEpisodeQuery(
        {
          normalizedTitle: normalizeSearchText(row.title ?? row.youtubeTitle),
          normalizedYoutubeTitle: normalizeSearchText(row.youtubeTitle),
          normalizedSlug: normalizeSearchText(row.slug),
          normalizedDescription: row.description ? normalizeSearchText(row.description) : null,
          normalizedYoutubeDescription: row.youtubeDescription ? normalizeSearchText(row.youtubeDescription) : null,
          normalizedSeriesTitle: seriesTitle ? normalizeSearchText(seriesTitle) : null,
          episodeNumber: row.episodeNumber,
        },
        normalizedQuery,
        numberToken,
      );
    };

    return rows.filter(matchesQuery).map(toEpisode);
  },

  async getEpisodeById(id) {
    const row = await prisma.episode.findUnique({ where: { id }, include: episodeInclude });
    return row ? toEpisode(row) : null;
  },

  async updateEpisode(id, patch) {
    try {
      const row = await prisma.episode.update({ where: { id }, data: patch, include: episodeInclude });
      return toEpisode(row);
    } catch {
      return null;
    }
  },

  async getRecommendationsByEpisode(episodeId) {
    const rows = await prisma.recommendation.findMany({ where: { episodeId }, orderBy: { order: "asc" } });
    return rows.map(toRecommendation);
  },

  async getTranscriptByEpisode(episodeId) {
    // "ar" is the only language this app's admin CMS has ever written (see
    // lib/admin/content/transcripts.ts's own doc comment) -- there is no
    // multi-language authoring UI, so this is the intended transcript, not
    // an assumed fallback. Uses the model's own @@unique([episodeId,
    // language]) constraint directly instead of an unfiltered findFirst,
    // which could return an arbitrary row if more than one language ever
    // exists for the same episode.
    const row = await prisma.transcript.findUnique({ where: { episodeId_language: { episodeId, language: "ar" } } });
    return row ? toTranscript(row) : null;
  },

  async getMindMapByEpisode(episodeId) {
    const row = await prisma.mindMap.findUnique({ where: { episodeId } });
    return row ? toMindMap(row) : null;
  },

  async search(query) {
    const trimmed = query.trim();
    if (!trimmed) {
      return { episodes: [], series: [], topics: [] } satisfies SearchResults;
    }

    const normalizedQuery = normalizeSearchText(trimmed);
    const numberToken = extractNumberToken(trimmed);
    if (!normalizedQuery && !numberToken) {
      return { episodes: [], series: [], topics: [] } satisfies SearchResults;
    }

    // Arabic normalization (digit script, diacritics, letter variants) can't
    // be expressed as a plain Postgres `contains`, so the published
    // candidate set -- already what listEpisodes()/listSeries()/listTopics()
    // fetch unconditionally elsewhere in this file -- is scored and ranked
    // in JS instead. At this catalog's scale (see docs/audio-pipeline.md)
    // that's a negligible cost; it would need revisiting only if the
    // catalog grew by orders of magnitude.
    const [episodeRows, seriesRows, topicRows] = await Promise.all([
      prisma.episode.findMany({ where: isPublishedWhere, include: episodeInclude, orderBy: { youtubePublishedAt: "desc" } }),
      prisma.series.findMany({ where: isPublishedWhere }),
      prisma.topic.findMany(),
    ]);

    const seriesTitleById = new Map(seriesRows.map((row) => [row.id, row.title]));

    const scoredEpisodes = episodeRows
      .map((row) => {
        const description = row.description ?? row.youtubeDescription ?? "";
        const seriesTitle = row.seriesId ? seriesTitleById.get(row.seriesId) : undefined;
        const score = Math.max(
          scoreTitle(normalizeSearchText(row.title ?? row.youtubeTitle), normalizedQuery),
          scoreTitle(normalizeSearchText(row.youtubeTitle), normalizedQuery),
          scoreEpisodeNumber(row.episodeNumber, numberToken),
          seriesTitle ? scoreContains(normalizeSearchText(seriesTitle), normalizedQuery, SCORE.SERIES_TITLE) : 0,
          scoreContains(normalizeSearchText(description), normalizedQuery, SCORE.DESCRIPTION),
        );
        return { row, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || b.row.youtubePublishedAt.getTime() - a.row.youtubePublishedAt.getTime());

    const scoredSeries = seriesRows
      .map((row) => ({
        row,
        score: Math.max(
          scoreTitle(normalizeSearchText(row.title), normalizedQuery),
          scoreContains(normalizeSearchText(row.description ?? ""), normalizedQuery, SCORE.DESCRIPTION),
        ),
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);

    const scoredTopics = topicRows
      .map((row) => ({
        row,
        score: Math.max(
          scoreTitle(normalizeSearchText(row.title), normalizedQuery),
          scoreContains(normalizeSearchText(row.description ?? ""), normalizedQuery, SCORE.DESCRIPTION),
        ),
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);

    return {
      episodes: scoredEpisodes.map((entry) => toEpisode(entry.row)),
      series: scoredSeries.map((entry) => toSeries(entry.row)),
      topics: scoredTopics.map((entry) => toTopic(entry.row)),
    } satisfies SearchResults;
  },
};
