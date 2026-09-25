"use client";

import { Check, Circle, MoreVertical, Trash2 } from "lucide-react";
import { OverflowMenu } from "@/components/notifications/overflow-menu";

/**
 * Per-row contextual menu (mark as read/unread, remove) -- replaces the old
 * always-visible destructive X. "Remove" is styled the same weight as "mark
 * as read/unread" at rest (see `.notif-menu__item--danger` in globals.css);
 * it only turns the danger color on hover/focus, so it never reads as more
 * prominent than the non-destructive action just for being in the list.
 */
export function NotificationItemMenu({
  isRead,
  disabled,
  onMarkRead,
  onMarkUnread,
  onRemove,
}: {
  isRead: boolean;
  disabled?: boolean;
  onMarkRead: () => void;
  onMarkUnread: () => void;
  onRemove: () => void;
}) {
  return (
    <OverflowMenu triggerLabel="خيارات الإشعار" triggerIcon={<MoreVertical size={16} />} disabled={disabled}>
      {(close) =>
        isRead ? (
          <>
            <button
              type="button"
              role="menuitem"
              className="notif-menu__item"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                close();
                onMarkUnread();
              }}
            >
              <Circle size={15} aria-hidden="true" />
              تحديد كغير مقروء
            </button>
            <button
              type="button"
              role="menuitem"
              className="notif-menu__item notif-menu__item--danger"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                close();
                onRemove();
              }}
            >
              <Trash2 size={15} aria-hidden="true" />
              إزالة الإشعار
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              role="menuitem"
              className="notif-menu__item"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                close();
                onMarkRead();
              }}
            >
              <Check size={15} aria-hidden="true" />
              تحديد كمقروء
            </button>
            <button
              type="button"
              role="menuitem"
              className="notif-menu__item notif-menu__item--danger"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                close();
                onRemove();
              }}
            >
              <Trash2 size={15} aria-hidden="true" />
              إزالة الإشعار
            </button>
          </>
        )
      }
    </OverflowMenu>
  );
}
