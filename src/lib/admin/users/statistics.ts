import { prisma } from "@/lib/db/prisma";

/**
 * Admin-only, server-only data access for the Users section of
 * /admin/statistics. Same shape as lib/admin/content/statistics.ts: small,
 * independent, count/groupBy-based queries the page can Promise.allSettled.
 *
 * Scope note (see the implementation report): this app's auth is a custom
 * Prisma `User` table + a stateless signed session cookie (src/lib/auth/
 * session.ts) -- there is no Supabase, no OAuth provider, no `lastSignInAt`,
 * and no email-verification field anywhere in the schema. Every function
 * here only reads what actually exists: `User.createdAt` for registration
 * timing, and the real content relations (SavedEpisode/WatchProgress/Note/
 * FollowedSeries) for activity. Nothing here approximates a sign-in event.
 *
 * Field hygiene: none of these queries select `email`/`name`/`passwordHash`
 * -- only ids, counts, and timestamps, per the "minimum data required"
 * privacy rule for an aggregate statistics page.
 */

// ---------------------------------------------------------------------------
// Registration timing (the one reliable per-user timestamp in the schema)
// ---------------------------------------------------------------------------

function startOfUTCDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function startOfUTCMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function addDays(date: Date, days: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days));
}

function addMonths(date: Date, months: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
}

function dayKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Every user's registration timestamp -- nothing else. One column, so even at a few tens of thousands of users this is a small, bounded payload (see getPublishingActivity in the content statistics module for the same pattern). Doubles as `dates.length` = total user count, so callers never need a separate `user.count()`. */
export async function getUserRegistrationDates(): Promise<Date[]> {
  const rows = await prisma.user.findMany({ select: { createdAt: true } });
  return rows.map((row) => row.createdAt);
}

export type NewUserCounts = {
  today: number;
  last7Days: number;
  last30Days: number;
  thisMonth: number;
  thisYear: number;
};

/** One pass over the timestamps already fetched for the page -- no extra queries per period. */
export function countNewUsers(registrationDates: Date[], now: Date): NewUserCounts {
  const todayStart = startOfUTCDay(now);
  const sevenDaysAgo = addDays(todayStart, -6);
  const thirtyDaysAgo = addDays(todayStart, -29);
  const monthStart = startOfUTCMonth(now);
  const yearStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));

  const counts: NewUserCounts = { today: 0, last7Days: 0, last30Days: 0, thisMonth: 0, thisYear: 0 };
  for (const date of registrationDates) {
    const time = date.getTime();
    if (time >= todayStart.getTime()) counts.today += 1;
    if (time >= sevenDaysAgo.getTime()) counts.last7Days += 1;
    if (time >= thirtyDaysAgo.getTime()) counts.last30Days += 1;
    if (time >= monthStart.getTime()) counts.thisMonth += 1;
    if (time >= yearStart.getTime()) counts.thisYear += 1;
  }
  return counts;
}

export type RegistrationRange = "7d" | "30d" | "90d" | "1y" | "all";

export const REGISTRATION_RANGES: { key: RegistrationRange; label: string }[] = [
  { key: "7d", label: "٧ أيام" },
  { key: "30d", label: "٣٠ يومًا" },
  { key: "90d", label: "٩٠ يومًا" },
  { key: "1y", label: "سنة" },
  { key: "all", label: "كل الوقت" },
];

/**
 * Turns a range key into a concrete window + bucket granularity: daily for
 * anything up to 90 days (readable as a horizontal chart, never a tall list
 * -- see MiniChart), monthly beyond that. "all" measures the real span from
 * the earliest registration rather than an arbitrary constant, so a young
 * app (days of history, like this one today) still gets a daily chart
 * instead of one meaningless monthly bar.
 */
export function resolveRegistrationWindow(
  range: RegistrationRange,
  earliestRegistration: Date | null,
  now: Date,
): { start: Date; end: Date; granularity: "day" | "month" } {
  if (range === "7d") return { start: addDays(startOfUTCDay(now), -6), end: now, granularity: "day" };
  if (range === "30d") return { start: addDays(startOfUTCDay(now), -29), end: now, granularity: "day" };
  if (range === "90d") return { start: addDays(startOfUTCDay(now), -89), end: now, granularity: "day" };
  if (range === "1y") return { start: addMonths(startOfUTCMonth(now), -11), end: now, granularity: "month" };

  const earliest = earliestRegistration ?? now;
  const spanDays = Math.round((startOfUTCDay(now).getTime() - startOfUTCDay(earliest).getTime()) / 86_400_000);
  return spanDays <= 90 ? { start: earliest, end: now, granularity: "day" } : { start: earliest, end: now, granularity: "month" };
}

export type RegistrationBucket = { key: string; date: Date; newUsers: number; totalUsers: number };

/**
 * Buckets registration timestamps into the requested window/granularity and
 * carries a running cumulative total forward from a baseline (every
 * registration strictly before the window) -- `newUsers` feeds the New Users
 * bar chart, `totalUsers` feeds the User Growth line chart, from one shared
 * series instead of two separate queries.
 */
export function buildRegistrationSeries(
  registrationDates: Date[],
  granularity: "day" | "month",
  rangeStart: Date,
  rangeEnd: Date,
): RegistrationBucket[] {
  const normalize = granularity === "day" ? startOfUTCDay : startOfUTCMonth;
  const step = granularity === "day" ? (date: Date) => addDays(date, 1) : (date: Date) => addMonths(date, 1);
  const keyOf = granularity === "day" ? dayKey : monthKey;

  const start = normalize(rangeStart);
  const end = normalize(rangeEnd);

  const buckets: { key: string; date: Date }[] = [];
  for (let cursor = start; cursor.getTime() <= end.getTime(); cursor = step(cursor)) {
    buckets.push({ key: keyOf(cursor), date: cursor });
  }
  const bucketKeys = new Set(buckets.map((bucket) => bucket.key));

  const counts = new Map<string, number>();
  let baseline = 0;
  for (const date of registrationDates) {
    if (date.getTime() < start.getTime()) {
      baseline += 1;
      continue;
    }
    const key = keyOf(date);
    if (bucketKeys.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  let cumulative = baseline;
  return buckets.map(({ key, date }) => {
    const newUsers = counts.get(key) ?? 0;
    cumulative += newUsers;
    return { key, date, newUsers, totalUsers: cumulative };
  });
}

// ---------------------------------------------------------------------------
// Activity (real content relations only -- never a sign-in proxy)
// ---------------------------------------------------------------------------

export type UserActivitySummary = {
  totalUsers: number;
  usersWithSaves: number;
  usersWithProgress: number;
  usersWithNotes: number;
  usersWithFollows: number;
  usersWithCompletedContent: number;
  /** Has at least one of: a save, a progress record, a note, a followed series. */
  usersWithAnyActivity: number;
  /** Has none of the above -- registered but the account shows no product usage in owned data. */
  usersWithNoActivity: number;
  totalSaves: number;
  totalProgressRecords: number;
  completedProgressRecords: number;
  distinctEpisodesWithProgress: number;
  totalNotes: number;
  totalFollows: number;
  averageSavesPerUser: number;
  /** null when no WatchProgress row has a valid (>0) duration to compute a percentage from. */
  averageCompletionPercent: number | null;
  episodesWithValidDurationSample: number;
};

export async function getUserActivitySummary(): Promise<UserActivitySummary> {
  const [
    totalUsers,
    usersWithSaves,
    usersWithProgress,
    usersWithNotes,
    usersWithFollows,
    usersWithCompletedContent,
    usersWithAnyActivity,
    usersWithNoActivity,
    totalSaves,
    totalProgressRecords,
    completedProgressRecords,
    totalNotes,
    totalFollows,
    progressWithValidDuration,
    episodesWithProgressGrouped,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { saves: { some: {} } } }),
    prisma.user.count({ where: { progresses: { some: {} } } }),
    prisma.user.count({ where: { notes: { some: {} } } }),
    prisma.user.count({ where: { follows: { some: {} } } }),
    prisma.user.count({ where: { progresses: { some: { completed: true } } } }),
    prisma.user.count({
      where: { OR: [{ saves: { some: {} } }, { progresses: { some: {} } }, { notes: { some: {} } }, { follows: { some: {} } }] },
    }),
    prisma.user.count({
      where: { saves: { none: {} }, progresses: { none: {} }, notes: { none: {} }, follows: { none: {} } },
    }),
    prisma.savedEpisode.count(),
    prisma.watchProgress.count(),
    prisma.watchProgress.count({ where: { completed: true } }),
    prisma.note.count(),
    prisma.followedSeries.count(),
    prisma.watchProgress.findMany({ where: { duration: { gt: 0 } }, select: { seconds: true, duration: true } }),
    prisma.watchProgress.groupBy({ by: ["episodeId"] }),
  ]);

  const averageCompletionPercent =
    progressWithValidDuration.length > 0
      ? (progressWithValidDuration.reduce((sum, row) => sum + Math.min(1, row.seconds / row.duration), 0) /
          progressWithValidDuration.length) *
        100
      : null;

  return {
    totalUsers,
    usersWithSaves,
    usersWithProgress,
    usersWithNotes,
    usersWithFollows,
    usersWithCompletedContent,
    usersWithAnyActivity,
    usersWithNoActivity,
    totalSaves,
    totalProgressRecords,
    completedProgressRecords,
    distinctEpisodesWithProgress: episodesWithProgressGrouped.length,
    totalNotes,
    totalFollows,
    averageSavesPerUser: totalUsers > 0 ? totalSaves / totalUsers : 0,
    averageCompletionPercent,
    episodesWithValidDurationSample: progressWithValidDuration.length,
  };
}

// ---------------------------------------------------------------------------
// Content usage highlights -- episode-identified only, never user-identified
// (no ranking of individual users by name/email, to keep this an aggregate
// view rather than a PII-exposing leaderboard).
// ---------------------------------------------------------------------------

export type EpisodeUsageRow = { id: string; title: string; count: number };

async function attachEpisodeTitles(grouped: { episodeId: string; _count: { _all: number } }[]): Promise<EpisodeUsageRow[]> {
  if (grouped.length === 0) return [];
  const episodes = await prisma.episode.findMany({
    where: { id: { in: grouped.map((row) => row.episodeId) } },
    select: { id: true, title: true, youtubeTitle: true },
  });
  const titleById = new Map(episodes.map((episode) => [episode.id, episode.title ?? episode.youtubeTitle]));
  return grouped.map((row) => ({ id: row.episodeId, title: titleById.get(row.episodeId) ?? "", count: row._count._all }));
}

/** Factually "most saved" -- never framed as "most popular" (see report). */
export async function getTopSavedEpisodes(limit = 5): Promise<EpisodeUsageRow[]> {
  const grouped = await prisma.savedEpisode.groupBy({
    by: ["episodeId"],
    _count: { _all: true },
    orderBy: { _count: { episodeId: "desc" } },
    take: limit,
  });
  return attachEpisodeTitles(grouped);
}

/** Only meaningful because `WatchProgress.completed` is a real, explicitly-set flag (95% threshold or manual toggle -- see src/lib/library/actions.ts), never inferred here. */
export async function getTopCompletedEpisodes(limit = 5): Promise<EpisodeUsageRow[]> {
  const grouped = await prisma.watchProgress.groupBy({
    by: ["episodeId"],
    where: { completed: true },
    _count: { _all: true },
    orderBy: { _count: { episodeId: "desc" } },
    take: limit,
  });
  return attachEpisodeTitles(grouped);
}
