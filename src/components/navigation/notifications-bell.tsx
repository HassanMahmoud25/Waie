"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatShortArabicDate } from "@/lib/utils/format";
import {
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
  getUnreadNotificationCountAction,
} from "@/lib/notifications/actions";
import { IconButton } from "@/components/ui/icon-button";
import { EmptyState } from "@/components/content/empty-state";
import type { AppNotification } from "@/types/notification";

const MENU_TRANSITION_MS = 180;
const MAX_BADGE_COUNT = 99;

/**
 * How often (ms) to poll getUnreadNotificationCountAction() while the tab is
 * open, on top of the immediate focus/visibility checks below (Phase 4C.1).
 * Deliberately conservative -- this is freshness, not real-time delivery.
 */
const POLL_INTERVAL_MS = 90_000;

/**
 * Header notification bell + dropdown. Fed once from the server (see
 * (site)/layout.tsx, which calls lib/notifications/queries.ts per request)
 * -- no client fetch on mount, no global store. Mirrors HeaderAuth's
 * open/close menu mechanics in site-header.tsx exactly (same outside-click/
 * Escape handling, same closing-animation delay).
 *
 * Clicking an unread notification marks it read optimistically (same
 * reconcile-on-response pattern as FollowedSeriesProvider) and navigates via
 * its own `href` -- for a NEW_EPISODE notification, straight to the episode.
 *
 * Freshness (Phase 4C.1): while mounted, periodically re-checks just the
 * unread count (never the full list) via a Server Action, and re-checks
 * immediately on window focus / tab visibility. If the count actually
 * changed, it calls router.refresh() so the layout re-fetches real
 * notification data through the existing Server Component path -- no
 * WebSockets/SSE/polling-every-few-seconds/global store.
 */
export function NotificationsBell({
  initialNotifications,
  initialUnreadCount,
}: {
  initialNotifications: AppNotification[];
  initialUnreadCount: number;
}) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);

  // Server truth arriving via fresh props (after router.refresh() below, or
  // a normal full navigation) always wins over local optimistic state --
  // this only fires when the parent Server Component actually re-ran, never
  // on a re-render triggered by this component's own state changes.
  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);
  useEffect(() => {
    setUnreadCount(initialUnreadCount);
  }, [initialUnreadCount]);

  // Freshness: poll the lightweight unread-count action, plus check
  // immediately on focus/visibility. A ref (not state) tracks the last known
  // count so the interval/listener closures never read a stale value, and a
  // second ref guards against overlapping checks (e.g. focus firing right
  // next to a poll tick). Everything is torn down on unmount, so
  // remounts (nav, Strict Mode) never leave a second timer/listener running.
  const unreadCountRef = useRef(unreadCount);
  unreadCountRef.current = unreadCount;
  const isCheckingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function checkForUpdates() {
      if (isCheckingRef.current || cancelled) return;
      isCheckingRef.current = true;
      try {
        const latestCount = await getUnreadNotificationCountAction();
        if (cancelled) return;
        if (latestCount !== unreadCountRef.current) {
          setUnreadCount(latestCount);
          router.refresh();
        }
      } catch {
        // A failed freshness check just means we stay on the last known
        // state until the next check -- never surfaced to the user.
      } finally {
        isCheckingRef.current = false;
      }
    }

    const intervalId = setInterval(checkForUpdates, POLL_INTERVAL_MS);
    const onFocus = () => checkForUpdates();
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") checkForUpdates();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [router]);

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
              <EmptyState icon={Bell} title="لا توجد إشعارات بعد" description="ستظهر هنا حلقات السلاسل التي تتابعها." />
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
                    {notification.episode && (
                      <span className="notif-item__thumb">
                        <Image src={notification.episode.thumbnailUrl} alt="" fill sizes="96px" />
                      </span>
                    )}
                    <span className="notif-item__body">
                      {notification.episode?.seriesTitle && (
                        <span className="episode-card__series notif-item__series">
                          {notification.episode.seriesTitle}
                        </span>
                      )}
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
