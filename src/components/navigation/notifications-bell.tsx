"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatShortArabicDate } from "@/lib/utils/format";
import { markNotificationAsReadAction, markAllNotificationsAsReadAction } from "@/lib/notifications/actions";
import { IconButton } from "@/components/ui/icon-button";
import { EmptyState } from "@/components/content/empty-state";
import type { AppNotification } from "@/types/notification";

const MENU_TRANSITION_MS = 180;
const MAX_BADGE_COUNT = 99;

/**
 * Header notification bell + dropdown (Phase 4C). Fed once from the server
 * (see (site)/layout.tsx, which calls lib/notifications/queries.ts per
 * request) -- no client fetch, no polling. Mirrors HeaderAuth's open/close
 * menu mechanics in site-header.tsx exactly (same outside-click/Escape
 * handling, same closing-animation delay).
 *
 * Clicking an unread notification marks it read optimistically (same
 * reconcile-on-response pattern as FollowedSeriesProvider) and navigates via
 * its own `href` -- for a NEW_EPISODE notification, straight to the episode.
 */
export function NotificationsBell({
  initialNotifications,
  initialUnreadCount,
}: {
  initialNotifications: AppNotification[];
  initialUnreadCount: number;
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      return;
    }
    const timeout = setTimeout(() => setShouldRender(false), MENU_TRANSITION_MS);
    return () => clearTimeout(timeout);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("mousedown", onClickOutside);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  function markRead(notificationId: string) {
    const notification = notifications.find((item) => item.id === notificationId);
    if (!notification || notification.readAt) return;

    setNotifications((prev) =>
      prev.map((item) => (item.id === notificationId ? { ...item, readAt: new Date().toISOString() } : item)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    startTransition(async () => {
      await markNotificationAsReadAction(notificationId);
    });
  }

  function markAllRead() {
    if (unreadCount === 0) return;
    setNotifications((prev) => prev.map((item) => (item.readAt ? item : { ...item, readAt: new Date().toISOString() })));
    setUnreadCount(0);

    startTransition(async () => {
      await markAllNotificationsAsReadAction();
    });
  }

  const badgeLabel = unreadCount > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : String(unreadCount);

  return (
    <div className="relative" ref={rootRef}>
      <IconButton
        aria-label={unreadCount > 0 ? `الإشعارات، ${badgeLabel} غير مقروءة` : "الإشعارات"}
        pressed={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="relative"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="notif-badge" aria-hidden="true">
            {badgeLabel}
          </span>
        )}
      </IconButton>

      {shouldRender && (
        <div role="menu" data-state={isOpen ? "open" : "closed"} className="notif-panel glass-strong">
          <div className="notif-panel__header">
            <p className="text-sm font-black">الإشعارات</p>
            {unreadCount > 0 && (
              <button type="button" className="notif-panel__mark-all" onClick={markAllRead}>
                تحديد الكل كمقروء
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="px-2 py-6">
              <EmptyState icon={Bell} title="لا توجد إشعارات بعد" />
            </div>
          ) : (
            <ul className="notif-panel__list">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <Link
                    href={notification.href}
                    role="menuitem"
                    className={cn("notif-item", !notification.readAt && "notif-item--unread")}
                    onClick={() => {
                      markRead(notification.id);
                      setIsOpen(false);
                    }}
                  >
                    <span className="notif-item__dot" aria-hidden="true" />
                    <span className="notif-item__body">
                      <span className="notif-item__title">{notification.title}</span>
                      <span className="notif-item__message">{notification.message}</span>
                      <span className="notif-item__time">
                        {formatShortArabicDate(new Date(notification.createdAt))}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <Link href="/notifications" role="menuitem" className="notif-panel__footer" onClick={() => setIsOpen(false)}>
            عرض كل الإشعارات
          </Link>
        </div>
      )}
    </div>
  );
}
