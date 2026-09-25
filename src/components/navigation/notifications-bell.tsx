"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { Bell, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatShortArabicDate } from "@/lib/utils/format";
import {
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
  deleteNotificationAction,
  getUnreadNotificationCountAction,
} from "@/lib/notifications/actions";
import { IconButton } from "@/components/ui/icon-button";
import { EmptyState } from "@/components/content/empty-state";
import { EpisodeThumbnail } from "@/components/content/episode-thumbnail";
import type { AppNotification } from "@/types/notification";

const MENU_TRANSITION_MS = 180;
const MAX_BADGE_COUNT = 99;

/** Matches `.container`'s own mobile side margin (see globals.css) -- the dropdown clamps to the same safe area every other page already respects, not an invented value. */
const PANEL_GUTTER_PX = 14;
/** The dropdown's width on any screen roomy enough for it -- shrinks (via `reposition` below) only when the viewport can't fit it plus the gutter on both sides. */
const PANEL_WIDTH_PX = 320;
/** Vertical gap between the trigger and the panel. */
const PANEL_GAP_PX = 8;

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
  const [panelStyle, setPanelStyle] = useState<{ top: number; left: number; width: number } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [pendingDeleteIds, setPendingDeleteIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  // The panel is portaled to document.body (see below) so its `position:
  // fixed` is always relative to the real viewport -- the header bar's own
  // `backdrop-filter` (the frosted-glass effect) would otherwise make it a
  // containing block for any fixed-position descendant, silently offsetting
  // every coordinate `reposition` computes. Portaling means the panel is no
  // longer a DOM descendant of rootRef, so outside-click detection below
  // checks both refs.
  const panelRef = useRef<HTMLDivElement>(null);

  // Measures the trigger's real position and clamps the panel to stay fully
  // within the viewport -- called right before opening (so the first paint
  // is already correct, no flash) and again on resize/orientation change
  // while open. Works identically at every width: on a roomy screen the
  // clamp never engages, which is exactly the previous desktop placement.
  const reposition = useCallback(() => {
    const trigger = rootRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const width = Math.min(PANEL_WIDTH_PX, window.innerWidth - PANEL_GUTTER_PX * 2);
    const left = Math.min(Math.max(rect.left, PANEL_GUTTER_PX), window.innerWidth - PANEL_GUTTER_PX - width);
    setPanelStyle({ top: rect.bottom + PANEL_GAP_PX, left, width });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener("resize", reposition);
    return () => window.removeEventListener("resize", reposition);
  }, [isOpen, reposition]);

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
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setIsOpen(false);
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

  // Auto-dismiss a mutation error after a few seconds instead of leaving it
  // stuck in the panel forever -- there's no explicit "OK" to click here.
  useEffect(() => {
    if (!error) return;
    const timeout = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(timeout);
  }, [error]);

  function markRead(notificationId: string) {
    const notification = notifications.find((item) => item.id === notificationId);
    if (!notification || notification.readAt) return;

    setNotifications((prev) =>
      prev.map((item) => (item.id === notificationId ? { ...item, readAt: new Date().toISOString() } : item)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    startTransition(async () => {
      const result = await markNotificationAsReadAction(notificationId);
      if (result.ok) router.refresh();
      // A failed mark-as-read isn't worth reverting/surfacing here -- the
      // user has already navigated away via the link by the time this
      // resolves, and the freshness poll will reconcile the count either way.
    });
  }

  function markAllRead() {
    if (unreadCount === 0 || isPending) return;
    const previous = notifications;
    const previousUnread = unreadCount;
    setNotifications((prev) => prev.map((item) => (item.readAt ? item : { ...item, readAt: new Date().toISOString() })));
    setUnreadCount(0);

    startTransition(async () => {
      const result = await markAllNotificationsAsReadAction();
      if (result.ok) {
        router.refresh();
      } else {
        setNotifications(previous);
        setUnreadCount(previousUnread);
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
    if (!notification.readAt) setUnreadCount((prev) => Math.max(0, prev - 1));

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
        // Put it back where it was rather than at either end of the list.
        setNotifications((prev) => {
          if (prev.some((item) => item.id === notification.id)) return prev;
          const restored = [...prev];
          restored.splice(Math.min(index, restored.length), 0, notification);
          return restored;
        });
        if (!notification.readAt) setUnreadCount((prev) => prev + 1);
        setError(result.error);
      }
    });
  }

  const badgeLabel = unreadCount > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : String(unreadCount);

  return (
    <div className="relative" ref={rootRef}>
      <IconButton
        aria-label={unreadCount > 0 ? `الإشعارات، ${badgeLabel} غير مقروءة` : "الإشعارات"}
        pressed={isOpen}
        onClick={() => {
          reposition();
          setIsOpen((open) => !open);
        }}
        className="relative"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="notif-badge" aria-hidden="true">
            {badgeLabel}
          </span>
        )}
      </IconButton>

      {shouldRender &&
        createPortal(
          <div
            ref={panelRef}
            role="menu"
            data-state={isOpen ? "open" : "closed"}
            className="notif-panel glass-strong"
            style={panelStyle ? { top: panelStyle.top, left: panelStyle.left, width: panelStyle.width } : undefined}
          >
            <div className="notif-panel__header">
              <p className="text-sm font-black">الإشعارات</p>
              {unreadCount > 0 && (
                <button type="button" className="notif-panel__mark-all" onClick={markAllRead} disabled={isPending}>
                  تحديد الكل كمقروء
                </button>
              )}
            </div>

            {error && <p className="notif-panel__error">{error}</p>}

            {notifications.length === 0 ? (
              <div className="px-2 py-6">
                <EmptyState icon={Bell} title="لا توجد إشعارات بعد" description="ستظهر هنا حلقات السلاسل التي تتابعها." />
              </div>
            ) : (
              <ul className="notif-panel__list">
                {notifications.map((notification) => (
                  <li key={notification.id} className="notif-item-row">
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
                          <EpisodeThumbnail src={notification.episode.thumbnailUrl} alt="" fill sizes="96px" />
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
                    <button
                      type="button"
                      className="notif-item__delete"
                      aria-label="حذف الإشعار"
                      disabled={pendingDeleteIds.has(notification.id)}
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <Link href="/notifications" role="menuitem" className="notif-panel__footer" onClick={() => setIsOpen(false)}>
              عرض كل الإشعارات
            </Link>
          </div>,
          document.body,
        )}
    </div>
  );
}
