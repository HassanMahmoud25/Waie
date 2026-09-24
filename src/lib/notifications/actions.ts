"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/server";
import { getUnreadNotificationCount } from "@/lib/notifications/queries";

export type MarkNotificationReadResult = { ok: true } | { ok: false; error: string };

/**
 * Marks one notification as read. The user id always comes from the server
 * session -- the client only ever sends the notificationId, never a userId,
 * so there is no way to mark another user's notification as read (the
 * `where` clause below scopes the update to `userId: user.id`, exactly like
 * updateNoteAction's ownership check in lib/library/actions.ts, except this
 * check happens in the same query rather than as a separate read).
 *
 * An already-read notification, or an id that doesn't belong to this user
 * (either because it doesn't exist or because it's someone else's), simply
 * matches zero rows -- updateMany makes both cases a silent no-op instead of
 * an error, so this is safe to call repeatedly.
 */
export async function markNotificationAsReadAction(notificationId: string): Promise<MarkNotificationReadResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "سجّل الدخول لعرض إشعاراتك." };
  if (typeof notificationId !== "string" || notificationId.trim() === "") {
    return { ok: false, error: "إشعار غير صحيح." };
  }

  try {
    await prisma.notification.updateMany({
      where: { id: notificationId, userId: user.id, readAt: null },
      data: { readAt: new Date() },
    });
    revalidatePath("/notifications");
    return { ok: true };
  } catch (error) {
    console.error("markNotificationAsReadAction failed:", error);
    return { ok: false, error: "حدث خطأ غير متوقع." };
  }
}

export type MarkAllNotificationsReadResult = { ok: true } | { ok: false; error: string };

/** Marks every one of the signed-in user's unread notifications as read, scoped to `userId: user.id` exactly like the single-notification action above. */
export async function markAllNotificationsAsReadAction(): Promise<MarkAllNotificationsReadResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "سجّل الدخول لعرض إشعاراتك." };

  try {
    await prisma.notification.updateMany({
      where: { userId: user.id, readAt: null },
      data: { readAt: new Date() },
    });
    revalidatePath("/notifications");
    return { ok: true };
  } catch (error) {
    console.error("markAllNotificationsAsReadAction failed:", error);
    return { ok: false, error: "حدث خطأ غير متوقع." };
  }
}

/**
 * Thin Server Action wrapper around getUnreadNotificationCount() (Phase
 * 4C.1) -- the one thing NotificationsBell's client-side freshness check
 * polls. A plain server helper can't be called from a Client Component;
 * this is the boundary, same as every other client-triggered read/write in
 * this app. Deliberately returns just the number, never the notification
 * list, so a 60-120s poll stays cheap.
 */
export async function getUnreadNotificationCountAction(): Promise<number> {
  return getUnreadNotificationCount();
}
