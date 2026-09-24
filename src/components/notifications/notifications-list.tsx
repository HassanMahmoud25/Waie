"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
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
 */
export function NotificationsList({ initialNotifications }: { initialNotifications: AppNotification[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [, startTransition] = useTransition();

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
    return <EmptyState icon={Bell} title="لا توجد إشعارات بعد" />;
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
              <span className="notif-item__dot" aria-hidden="true" />
              <span className="notif-item__body">
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
