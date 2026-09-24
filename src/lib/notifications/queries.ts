import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/server";
import type { AppNotification } from "@/types/notification";

/** Bounded list size for getNotifications() -- Phase 4C has no pagination (that's Phase 4D). */
const NOTIFICATIONS_LIMIT = 30;

function toAppNotification(row: {
  id: string;
  type: string;
  title: string;
  message: string;
  href: string;
  readAt: Date | null;
  createdAt: Date;
}): AppNotification {
  return {
    id: row.id,
    type: row.type as AppNotification["type"],
    title: row.title,
    message: row.message,
    href: row.href,
    readAt: row.readAt ? row.readAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
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
export async function getNotifications(): Promise<AppNotification[]> {
  const user = await getSessionUser();
  if (!user) return [];

  const rows = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: NOTIFICATIONS_LIMIT,
    select: { id: true, type: true, title: true, message: true, href: true, readAt: true, createdAt: true },
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
