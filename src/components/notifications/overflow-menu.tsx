"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

const MENU_TRANSITION_MS = 180;
/** Matches `.container`'s own mobile side margin -- same reasoning as NotificationsBell's panel. */
const MENU_GUTTER_PX = 14;
const MENU_WIDTH_PX = 190;
const MENU_GAP_PX = 6;

/**
 * Shared shell for a small contextual popover menu -- same open/close
 * mechanics as HeaderAuth's avatar menu and NotificationsBell's own panel
 * (outside-click + Escape, closing-animation delay).
 *
 * Portaled + viewport-clamped exactly like NotificationsBell's panel, for
 * the same two reasons: a per-item trigger sits at the row's own trailing
 * edge (safe), but the page header's "more actions" trigger sits wherever
 * its flex siblings leave it -- not reliably at any edge -- so a menu that
 * just opens "inward" from the trigger isn't safe in general. And any
 * ancestor with `backdrop-filter` (e.g. the dropdown panel's own
 * `glass-strong`) would make plain `position: fixed` relative to *it*
 * instead of the viewport, so this portals to `document.body` to sidestep
 * that regardless of where it's used from.
 */
export function OverflowMenu({
  triggerLabel,
  triggerIcon,
  disabled,
  children,
}: {
  triggerLabel: string;
  triggerIcon: ReactNode;
  disabled?: boolean;
  /** Render-prop so menu items can close the menu before running their own action. */
  children: (close: () => void) => ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [menuStyle, setMenuStyle] = useState<{ top: number; left: number; width: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const reposition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const width = Math.min(MENU_WIDTH_PX, window.innerWidth - MENU_GUTTER_PX * 2);
    const left = Math.min(Math.max(rect.left, MENU_GUTTER_PX), window.innerWidth - MENU_GUTTER_PX - width);
    setMenuStyle({ top: rect.bottom + MENU_GAP_PX, left, width });
  }, []);

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
    window.addEventListener("resize", reposition);
    return () => window.removeEventListener("resize", reposition);
  }, [isOpen, reposition]);

  useEffect(() => {
    if (!isOpen) return;
    const onClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
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

  return (
    <div className="notif-menu-root" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="notif-menu-trigger"
        aria-label={triggerLabel}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          reposition();
          setIsOpen((open) => !open);
        }}
      >
        {triggerIcon}
      </button>

      {shouldRender &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            data-state={isOpen ? "open" : "closed"}
            className="notif-menu glass-strong"
            style={menuStyle ? { top: menuStyle.top, left: menuStyle.left, width: menuStyle.width } : undefined}
          >
            {children(() => setIsOpen(false))}
          </div>,
          document.body,
        )}
    </div>
  );
}
