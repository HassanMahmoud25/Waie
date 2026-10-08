import { prisma } from "@/lib/db/prisma";

/**
 * Admin-only, server-only data access for the /admin/statistics dashboard.
 * Same shape as the rest of lib/admin/content/*.ts (talks to Prisma
 * directly, deliberately separate from src/lib/repositories): every function
 * here is a small, independent aggregate/groupBy query so the calling page
 * can Promise.allSettled them and let one failure leave the rest of the
 * dashboard intact, instead of one big query that fails all-or-nothing.
 *
 * This is strictly CMS/content statistics -- everything below is computed
 * from data the app already owns (Episode/Series/Person/EpisodeParticipant
 * rows). No visitor/session/event tracking of any kind is introduced here.
 */

export type ContentOverview = {
  totalEpisodes: number;
  publishedEpisodes: number;
  draftEpisodes: number;
  archivedEpisodes: number;
  totalSeries: number;
  totalPeople: number;
  totalDurationSeconds: number;
};

/** One GROUP BY plus three COUNTs -- never a full listing just to read a length. */
export async function getContentOverview(): Promise<ContentOverview> {
  const [statusRows, totalSeries, totalPeople, durationAgg] = await Promise.all([
    prisma.episode.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.series.count(),
    prisma.person.count(),
    prisma.episode.aggregate({ _sum: { youtubeDurationSeconds: true } }),
  ]);

  const byStatus = { DRAFT: 0, PUBLISHED: 0, ARCHIVED: 0 };
  for (const row of statusRows) byStatus[row.status] += row._count._all;

  return {
    totalEpisodes: byStatus.DRAFT + byStatus.PUBLISHED + byStatus.ARCHIVED,
    publishedEpisodes: byStatus.PUBLISHED,
    draftEpisodes: byStatus.DRAFT,
    archivedEpisodes: byStatus.ARCHIVED,
    totalSeries,
    totalPeople,
    totalDurationSeconds: durationAgg._sum.youtubeDurationSeconds ?? 0,
  };
}

export type EpisodeDurationStats = {
  episodesTotal: number;
  episodesWithDuration: number;
  totalSeconds: number;
  averageSeconds: number;
  shortest: { title: string; seconds: number } | null;
  longest: { title: string; seconds: number } | null;
};

/**
 * `youtubeDurationSeconds` is a required field, but a bad sync can still
 * leave a `0` on a row (see prisma/schema.prisma) -- every aggregate here
 * excludes those explicitly rather than letting one bad row silently drag
 * the average down or win "shortest episode".
 */
export async function getEpisodeDurationStats(): Promise<EpisodeDurationStats> {
  const validDuration = { youtubeDurationSeconds: { gt: 0 } } as const;
  const pickTitle = { title: true, youtubeTitle: true, youtubeDurationSeconds: true } as const;

  const [episodesTotal, agg, shortestRow, longestRow] = await Promise.all([
    prisma.episode.count(),
    prisma.episode.aggregate({
      where: validDuration,
      _sum: { youtubeDurationSeconds: true },
      _avg: { youtubeDurationSeconds: true },
      _count: { _all: true },
    }),
    prisma.episode.findFirst({ where: validDuration, orderBy: { youtubeDurationSeconds: "asc" }, select: pickTitle }),
    prisma.episode.findFirst({ where: validDuration, orderBy: { youtubeDurationSeconds: "desc" }, select: pickTitle }),
  ]);

  return {
    episodesTotal,
    episodesWithDuration: agg._count._all,
    totalSeconds: agg._sum.youtubeDurationSeconds ?? 0,
    averageSeconds: agg._count._all > 0 ? Math.round(agg._avg.youtubeDurationSeconds ?? 0) : 0,
    shortest: shortestRow
      ? { title: shortestRow.title ?? shortestRow.youtubeTitle, seconds: shortestRow.youtubeDurationSeconds }
      : null,
    longest: longestRow
      ? { title: longestRow.title ?? longestRow.youtubeTitle, seconds: longestRow.youtubeDurationSeconds }
      : null,
  };
}

export type SeriesDistributionRow = { id: string; title: string; count: number };

/** No-series episodes are a real, small bucket (see Content Completeness) -- surfaced here as "بلا سلسلة" rather than silently dropped from the distribution. */
export async function getEpisodesBySeries(): Promise<SeriesDistributionRow[]> {
  const grouped = await prisma.episode.groupBy({ by: ["seriesId"], _count: { _all: true } });
  const seriesIds = grouped.map((row) => row.seriesId).filter((id): id is string => id !== null);
  const seriesRows = seriesIds.length > 0 ? await prisma.series.findMany({ where: { id: { in: seriesIds } }, select: { id: true, title: true } }) : [];
  const titleById = new Map(seriesRows.map((series) => [series.id, series.title]));

  const rows = grouped
    .filter((row) => row.seriesId !== null)
    .map((row) => ({ id: row.seriesId as string, title: titleById.get(row.seriesId as string) ?? "", count: row._count._all }))
    .sort((a, b) => b.count - a.count);

  const withoutSeries = grouped.find((row) => row.seriesId === null);
  if (withoutSeries && withoutSeries._count._all > 0) {
    rows.push({ id: "__none__", title: "بلا سلسلة", count: withoutSeries._count._all });
  }

  return rows;
}

export type PublishingMonthBucket = { month: string; monthDate: Date; count: number };

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

/**
 * Fills every month in the trailing `monthsBack`-month window (ending on
 * `referenceDate`'s month) with 0 before overlaying the real counts, so a
 * quiet month reads as "no episodes that month" rather than disappearing
 * from the chart. Pure and exported so the bucketing rule itself is
 * unit-testable without a database (see statistics.test.ts).
 */
export function buildMonthlyBuckets(publishedDates: Date[], monthsBack: number, referenceDate: Date): PublishingMonthBucket[] {
  const counts = new Map<string, number>();
  for (const date of publishedDates) {
    const key = monthKey(date);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const startYear = referenceDate.getUTCFullYear();
  const startMonth = referenceDate.getUTCMonth() - (monthsBack - 1);

  return Array.from({ length: monthsBack }, (_, index) => {
    const monthDate = new Date(Date.UTC(startYear, startMonth + index, 1));
    const key = monthKey(monthDate);
    return { month: key, monthDate, count: counts.get(key) ?? 0 };
  });
}

/**
 * `youtubePublishedAt` (YouTube-owned, required on every Episode) is the one
 * reliable publication timestamp in the schema -- selecting just that column
 * for every episode is a small, bounded payload (one Date per row), bucketed
 * into calendar months in memory. Never inferred from createdAt/updatedAt.
 */
export async function getPublishingActivity(monthsBack = 12): Promise<PublishingMonthBucket[]> {
  const rows = await prisma.episode.findMany({ select: { youtubePublishedAt: true } });
  return buildMonthlyBuckets(rows.map((row) => row.youtubePublishedAt), monthsBack, new Date());
}

export type ParticipantStatistics = {
  totalPeople: number;
  totalParticipantLinks: number;
  episodesTotal: number;
  episodesWithoutParticipants: number;
  averagePerEpisode: number;
  byParticipant: { id: string; name: string; count: number }[];
};

/**
 * Deliberately neutral: `byParticipant` is a distribution (how many episodes
 * each person is tagged on), sorted by count only because that's the
 * readable order for a bar list -- never rendered or labeled as "most
 * popular"/"top" anywhere in the UI (see content-completeness.tsx/page.tsx).
 */
export async function getParticipantStatistics(): Promise<ParticipantStatistics> {
  const [totalPeople, episodesTotal, episodesWithoutParticipants, totalParticipantLinks, grouped] = await Promise.all([
    prisma.person.count(),
    prisma.episode.count(),
    prisma.episode.count({ where: { participants: { none: {} } } }),
    prisma.episodeParticipant.count(),
    prisma.episodeParticipant.groupBy({ by: ["personId"], _count: { _all: true } }),
  ]);

  const personIds = grouped.map((row) => row.personId);
  const people = personIds.length > 0 ? await prisma.person.findMany({ where: { id: { in: personIds } }, select: { id: true, name: true } }) : [];
  const nameById = new Map(people.map((person) => [person.id, person.name]));

  const byParticipant = grouped
    .map((row) => ({ id: row.personId, name: nameById.get(row.personId) ?? "", count: row._count._all }))
    .sort((a, b) => b.count - a.count);

  return {
    totalPeople,
    totalParticipantLinks,
    episodesTotal,
    episodesWithoutParticipants,
    averagePerEpisode: episodesTotal > 0 ? totalParticipantLinks / episodesTotal : 0,
    byParticipant,
  };
}

export type CompletenessField = { key: string; label: string; present: number; total: number };
export type ContentCompleteness = { total: number; fields: CompletenessField[] };

/**
 * Scoped to PUBLISHED episodes only -- this is about what's actually missing
 * from live public content, not drafts still being assembled. Thumbnail is
 * deliberately not a field here: `youtubeThumbnailUrl` is required and
 * non-empty on every Episode row (verified against production data), so it
 * can never be "missing" -- a permanent 100% check would be noise, not a
 * signal. See the implementation report for the full reasoning.
 */
export async function getContentCompleteness(): Promise<ContentCompleteness> {
  const published = { status: "PUBLISHED" } as const;

  const [total, missingDescription, missingSeries, missingDuration, missingParticipants] = await Promise.all([
    prisma.episode.count({ where: published }),
    prisma.episode.count({ where: { ...published, description: null, youtubeDescription: null } }),
    prisma.episode.count({ where: { ...published, seriesId: null } }),
    prisma.episode.count({ where: { ...published, youtubeDurationSeconds: { lte: 0 } } }),
    prisma.episode.count({ where: { ...published, participants: { none: {} } } }),
  ]);

  const fields: CompletenessField[] = [
    { key: "description", label: "الوصف", present: total - missingDescription, total },
    { key: "series", label: "السلسلة", present: total - missingSeries, total },
    { key: "duration", label: "مدة الحلقة", present: total - missingDuration, total },
    { key: "participants", label: "المشاركون", present: total - missingParticipants, total },
  ];

  return { total, fields };
}
