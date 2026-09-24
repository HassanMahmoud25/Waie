"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatShortArabicDate } from "@/lib/utils/format";
import { markNotificationAsReadAction, markAllNotificationsAsReadAction } from "@/lib/notifications/actions";
import { EmptyState } from "@/components/content/empty-state";
import type { AppNotification } from "@/types/notification";

/**
 * Full notification list for /notifications -- same optimistic
 * mark-as-read-then-reconcile approach as NotificationsBell (its header
 * dropdown counterpart), just laid out as a page instead of a popover.
 *
 * Also picks up fresh server data the same way NotificationsBell does: if
 * this page is the active route when the bell's freshness check calls
 * router.refresh() (see notifications-bell.tsx), the page Server Component
 * re-runs and passes a new `initialNotifications` array -- this effect syncs
 * local state to it without clobbering an in-flight optimistic read.
 */
export function NotificationsList({ initialNotifications }: { initialNotifications: AppNotification[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

  const unreadCount = notifications.filter((item) => !item.readAt).length;

  function markRead(notificationId: string) {
    const notification = notifications.find((item) => item.id === notificationId);
    if (!notification || notification.readAt) return;

    setNotifications((prev) =>
      prev.map((item) => (item.id === notificationId ? { ...item, readAt: new Date().toISOString() } : item)),
    );
    startTransition(async () => {
      await markNotificationAsReadAction(notificationId);
    });
  }

  function markAllRead() {
    if (unreadCount === 0) return;
    setNotifications((prev) => prev.map((item) => (item.readAt ? item : { ...item, readAt: new Date().toISOString() })));
    startTransition(async () => {
      await markAllNotificationsAsReadAction();
    });
  }

  if (notifications.length === 0) {
    return (
      <div className="notif-page__empty">
        <EmptyState
          icon={Bell}
          title="لا توجد إشعارات بعد"
          description="ستصلك هنا إشعارات الحلقات الجديدة من السلاسل التي تتابعها."
        />
      </div>
    );
  }

  return (
    <div>
      {unreadCount > 0 && (
        <div className="mb-3 flex justify-end">
          <button type="button" className="notif-panel__mark-all" onClick={markAllRead}>
            تحديد الكل كمقروء
          </button>
        </div>
      )}

      <ul className="notif-panel__list notif-panel__list--page">
        {notifications.map((notification) => (
          <li key={notification.id}>
            <Link
              href={notification.href}
              className={cn("notif-item", !notification.readAt && "notif-item--unread")}
              onClick={() => markRead(notification.id)}
            >
              {notification.episode && (
                <span className="notif-item__thumb">
                  <Image src={notification.episode.thumbnailUrl} alt="" fill sizes="128px" />
                </span>
              )}
              <span className="notif-item__body">
                {notification.episode?.seriesTitle && (
                  <span className="episode-card__series notif-item__series">{notification.episode.seriesTitle}</span>
                )}
                <span className="notif-item__title">{notification.title}</span>
                <span className="notif-item__message">{notification.message}</span>
                <span className="notif-item__time">{formatShortArabicDate(new Date(notification.createdAt))}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
