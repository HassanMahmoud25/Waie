"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/** Length of the `.note-modal-*` / `.search-modal-*` exit animations in globals.css. */
const EXIT_TRANSITION_MS = 220;
const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The behavior every modal dialog in the app shares (each one portals into
 * <body> and animates off a `data-state` attribute):
 *
 * - stays rendered through the exit animation after `open` turns false
 * - locks page scroll while rendered
 * - Escape closes, unless `canClose` is false (e.g. while a request is in flight)
 * - focus moves into the panel on open -- to the element marked
 *   `data-autofocus`, else the panel itself, unless something inside (an
 *   autofocusing field) already took it -- Tab stays inside, and focus
 *   returns to the trigger (or `returnFocusRef`, if the trigger is gone) on close
 *
 * Render the dialog only while `isRendered`, attach `panelRef` to the panel
 * (with tabIndex={-1}), and use `state` as the panel's and backdrop's `data-state`.
 */
export function useDialog({
  open,
  onClose,
  canClose = true,
  returnFocusRef,
}: {
  open: boolean;
  onClose: () => void;
  canClose?: boolean;
  /** Where focus lands on close when the original trigger is gone (e.g. it lived in a dropdown that closed). */
  returnFocusRef?: RefObject<HTMLElement | null>;
}) {
  const [mounted, setMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open) {
      // Captured before the panel (and anything in it that autofocuses) mounts.
      triggerRef.current = document.activeElement as HTMLElement | null;
      setShouldRender(true);
      return;
    }
    const timeout = setTimeout(() => setShouldRender(false), EXIT_TRANSITION_MS);
    return () => clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    if (!shouldRender) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [shouldRender]);

  const isShown = open && shouldRender && mounted;
  useEffect(() => {
    if (!isShown) return;
    const panel = panelRef.current;
    if (panel && !panel.contains(document.activeElement)) {
      (panel.querySelector<HTMLElement>("[data-autofocus]") ?? panel).focus({ preventScroll: true });
    }
    // Read at close time on purpose: the fallback is whatever that ref holds then.
    const fallback = returnFocusRef;
    return () => {
      const trigger = triggerRef.current;
      const target = trigger?.isConnected && trigger !== document.body ? trigger : fallback?.current;
      target?.focus({ preventScroll: true });
    };
  }, [isShown, returnFocusRef]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (canClose) onClose();
        return;
      }
      const panel = panelRef.current;
      if (event.key !== "Tab" || !panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !panel.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, canClose, onClose]);

  return { isRendered: mounted && shouldRender, state: open ? ("open" as const) : ("closed" as const), panelRef };
}
