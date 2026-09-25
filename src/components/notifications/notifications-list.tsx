"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Bell, MoreVertical, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatRelativeArabicDate } from "@/lib/utils/format";
import {
  markNotificationAsReadAction,
  markNotificationAsUnreadAction,
  markAllNotificationsAsReadAction,
  deleteNotificationAction,
  clearNotificationHistoryAction,
} from "@/lib/notifications/actions";
import { EmptyState } from "@/components/content/empty-state";
import { EpisodeThumbnail } from "@/components/content/episode-thumbnail";
import { ClearNotificationsModal } from "@/components/notifications/clear-notifications-modal";
import { NotificationItemMenu } from "@/components/notifications/notification-item-menu";
import { OverflowMenu } from "@/components/notifications/overflow-menu";
import { Tabs, TabList, Tab, TabPanel } from "@/components/navigation/tabs";
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
 * local state to it without clobbering an in-flight optimistic read. Every
 * mutation here also calls router.refresh() itself so the header dropdown
 * (a persistent sibling outside this page's own subtree) picks up the same
 * change immediately instead of waiting for its own poll tick.
 */
export function NotificationsList({ initialNotifications }: { initialNotifications: AppNotification[] }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isPending, startTransition] = useTransition();
  const [pendingDeleteIds, setPendingDeleteIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

  useEffect(() => {
    if (!error) return;
    const timeout = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(timeout);
  }, [error]);

  const unreadCount = notifications.filter((item) => !item.readAt).length;

  function markRead(notificationId: string) {
    const notification = notifications.find((item) => item.id === notificationId);
    if (!notification || notification.readAt) return;

    setNotifications((prev) =>
      prev.map((item) => (item.id === notificationId ? { ...item, readAt: new Date().toISOString() } : item)),
    );
    startTransition(async () => {
      const result = await markNotificationAsReadAction(notificationId);
      if (result.ok) router.refresh();
    });
  }

  function markAsReadFromMenu(notificationId: string) {
    const notification = notifications.find((item) => item.id === notificationId);
    if (!notification || notification.readAt) return;
    const nowIso = new Date().toISOString();

    setNotifications((prev) => prev.map((item) => (item.id === notificationId ? { ...item, readAt: nowIso } : item)));

    startTransition(async () => {
      const result = await markNotificationAsReadAction(notificationId);
      if (result.ok) {
        router.refresh();
      } else {
        setNotifications((prev) => prev.map((item) => (item.id === notificationId ? { ...item, readAt: null } : item)));
        setError(result.error);
      }
    });
  }

  function markAsUnreadFromMenu(notificationId: string) {
    const notification = notifications.find((item) => item.id === notificationId);
    if (!notification || !notification.readAt) return;
    const previousReadAt = notification.readAt;

    setNotifications((prev) => prev.map((item) => (item.id === notificationId ? { ...item, readAt: null } : item)));

    startTransition(async () => {
      const result = await markNotificationAsUnreadAction(notificationId);
      if (result.ok) {
        router.refresh();
      } else {
        setNotifications((prev) =>
          prev.map((item) => (item.id === notificationId ? { ...item, readAt: previousReadAt } : item)),
        );
        setError(result.error);
      }
    });
  }

  function markAllRead() {
    if (unreadCount === 0 || isPending) return;
    const previous = notifications;
    setNotifications((prev) => prev.map((item) => (item.readAt ? item : { ...item, readAt: new Date().toISOString() })));

    startTransition(async () => {
      const result = await markAllNotificationsAsReadAction();
      if (result.ok) {
        router.refresh();
      } else {
        setNotifications(previous);
        setError(result.error);
      }
    });
  }

  function deleteNotification(notificationId: string) {
    if (pendingDeleteIds.has(notificationId)) return;
    const index = notifications.findIndex((item) => item.id === notificationId);
    if (index === -1) return;
    const notification = notifications[index]!;

    setPendingDeleteIds((prev) => new Set(prev).add(notificationId));
    setNotifications((prev) => prev.filter((item) => item.id !== notificationId));

    startTransition(async () => {
      const result = await deleteNotificationAction(notificationId);
      setPendingDeleteIds((prev) => {
        const next = new Set(prev);
        next.delete(notificationId);
        return next;
      });
      if (result.ok) {
        router.refresh();
      } else {
        setNotifications((prev) => {
          if (prev.some((item) => item.id === notification.id)) return prev;
          const restored = [...prev];
          restored.splice(Math.min(index, restored.length), 0, notification);
          return restored;
        });
        setError(result.error);
      }
    });
  }

  function confirmClearHistory() {
    if (isClearing) return;
    setIsClearing(true);
    const previous = notifications;
    setNotifications([]);

    startTransition(async () => {
      const result = await clearNotificationHistoryAction();
      setIsClearing(false);
      setIsClearModalOpen(false);
      if (result.ok) {
        router.refresh();
      } else {
        setNotifications(previous);
        setError(result.error);
      }
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

  function renderList(items: AppNotification[]) {
    if (items.length === 0) {
      return (
        <div className="">
          <EmptyState icon={Bell} title="لا توجد إشعارات غير مقروءة" description="كل إشعاراتك مقروءة حاليًا." />
        </div>
      );
    }

    return (
      <ul className="notif-panel__list notif-panel__list--page">
        {items.map((notification) => (
          <li key={notification.id} className="notif-item-row">
            <Link
              href={notification.href}
              className={cn("notif-item", !notification.readAt && "notif-item--unread")}
              onClick={() => markRead(notification.id)}
            >
              {notification.episode && (
                <span className="notif-item__thumb media-stretch">
                  <span aria-hidden="true" className="aspect-video" />
                  <span className="notif-item__thumb-media media">
                    <EpisodeThumbnail src={notification.episode.thumbnailUrl} alt="" fill sizes="76px" />
                  </span>
                </span>
              )}
              <span className="notif-item__body">
                {notification.episode?.seriesTitle && (
                  <span className="notif-item__context">{notification.episode.seriesTitle}</span>
                )}
                <span className="notif-item__title-row">
                  {!notification.readAt && <span className="notif-item__dot" aria-hidden="true" />}
                  <span className="notif-item__title">{notification.message}</span>
                </span>
                <span className="notif-item__time">{formatRelativeArabicDate(new Date(notification.createdAt))}</span>
              </span>
            </Link>
            <NotificationItemMenu
              isRead={Boolean(notification.readAt)}
              disabled={pendingDeleteIds.has(notification.id)}
              onMarkRead={() => markAsReadFromMenu(notification.id)}
              onMarkUnread={() => markAsUnreadFromMenu(notification.id)}
              onRemove={() => deleteNotification(notification.id)}
            />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div>
      {error && <p className="notif-panel__error mb-3">{error}</p>}

      <Tabs activeId={filter} onActiveChange={(id) => setFilter(id as "all" | "unread")} defaultActiveId="all">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <TabList aria-label="تصفية الإشعارات" className="tab-list--compact">
            <Tab id="all">الكل</Tab>
            <Tab id="unread">{unreadCount > 0 ? `غير مقروءة (${unreadCount})` : "غير مقروءة"}</Tab>
          </TabList>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button type="button" className="notif-panel__mark-all" onClick={markAllRead} disabled={isPending}>
                تحديد الكل كمقروء
              </button>
            )}
            <OverflowMenu triggerLabel="خيارات إضافية" triggerIcon={<MoreVertical size={16} />} disabled={isPending}>
              {(close) => (
                <button
                  type="button"
                  role="menuitem"
                  className="notif-menu__item notif-menu__item--danger"
                  onClick={() => {
                    close();
                    setIsClearModalOpen(true);
                  }}
                >
                  <Trash2 size={15} aria-hidden="true" />
                  حذف كل الإشعارات
                </button>
              )}
            </OverflowMenu>
          </div>
        </div>

        <TabPanel id="all">{renderList(notifications)}</TabPanel>
        <TabPanel id="unread">{renderList(notifications.filter((item) => !item.readAt))}</TabPanel>
      </Tabs>

      <ClearNotificationsModal
        open={isClearModalOpen}
        pending={isClearing}
        onCancel={() => setIsClearModalOpen(false)}
        onConfirm={confirmClearHistory}
      />
    </div>
  );
}
