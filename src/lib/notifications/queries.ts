import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/server";
import type { AppNotification } from "@/types/notification";

/** Bounded list size for getNotifications() on /notifications -- Phase 4C has no pagination (that's Phase 4D). */
const NOTIFICATIONS_LIMIT = 30;

/**
 * The header dropdown (NotificationsBell) shows far fewer than the full page
 * -- it's a glance, not the archive, and it must never load/render hundreds
 * of rows just to display a handful. Kept separate from NOTIFICATIONS_LIMIT
 * so the two call sites ((site)/layout.tsx for the header, /notifications for
 * the page) can bound independently through the same query/mapping (no
 * duplicated thumbnail logic).
 */
export const HEADER_NOTIFICATIONS_LIMIT = 6;

function toAppNotification(row: {
  id: string;
  type: string;
  title: string;
  message: string;
  href: string;
  readAt: Date | null;
  createdAt: Date;
  episode: { thumbnailUrl: string | null; youtubeThumbnailUrl: string; title: string | null; youtubeTitle: string; series: { title: string } | null } | null;
}): AppNotification {
  return {
    id: row.id,
    type: row.type as AppNotification["type"],
    title: row.title,
    message: row.message,
    href: row.href,
    readAt: row.readAt ? row.readAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    episode: row.episode
      ? {
          thumbnailUrl: row.episode.thumbnailUrl ?? row.episode.youtubeThumbnailUrl,
          title: row.episode.title ?? row.episode.youtubeTitle,
          seriesTitle: row.episode.series?.title ?? null,
        }
      : null,
  };
}

/**
 * The signed-in user's most recent notifications, newest first -- never
 * another user's. The user id always comes from the server session
 * (getSessionUser), never a caller-supplied id. Anonymous visitors get an
 * empty list.
 *
 * Plain server-side helper, not a Server Action -- only ever called from
 * Server Components (mirrors lib/library/followed-series.ts exactly).
 */
export async function getNotifications(limit: number = NOTIFICATIONS_LIMIT): Promise<AppNotification[]> {
  const user = await getSessionUser();
  if (!user) return [];

  const rows = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      type: true,
      title: true,
      message: true,
      href: true,
      readAt: true,
      createdAt: true,
      // One batched join, not a per-notification fetch -- Prisma resolves
      // this as a single query (or a single extra query keyed by the same
      // notification ids), never N+1.
      episode: {
        select: {
          thumbnailUrl: true,
          youtubeThumbnailUrl: true,
          title: true,
          youtubeTitle: true,
          series: { select: { title: true } },
        },
      },
    },
  });
  return rows.map(toAppNotification);
}

/**
 * Just the unread count, for the header badge -- a single `count`, never the
 * full notification list. Anonymous visitors get 0.
 */
export async function getUnreadNotificationCount(): Promise<number> {
  const user = await getSessionUser();
  if (!user) return 0;

  return prisma.notification.count({ where: { userId: user.id, readAt: null } });
}
