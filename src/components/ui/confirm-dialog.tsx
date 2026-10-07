"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { CircleAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const TRANSITION_MS = 220;
const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * A compact yes/no confirmation -- the same portal/backdrop/alertdialog
 * plumbing (and note-modal-* enter/exit keyframes) as note-delete-modal and
 * episode-delete-modal, as a reusable primitive with real focus handling:
 * Cancel gets focus on open (the safe default), Tab stays inside the panel,
 * and focus goes back to the trigger (or `returnFocusRef`) on close.
 *
 * `pending` is owned by the caller, who runs the actual action. While it's
 * true, Cancel/backdrop/Escape are all ignored and Confirm is disabled, so an
 * in-flight action can't be interrupted or fired twice.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  icon,
  confirmLabel,
  pendingLabel,
  cancelLabel = "إلغاء",
  pending = false,
  error,
  returnFocusRef,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  confirmLabel: string;
  pendingLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  error?: string | null;
  /** Where focus lands on close when the original trigger is gone (e.g. it lived in a dropdown that closed). */
  returnFocusRef?: RefObject<HTMLElement | null>;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      return;
    }
    const timeout = setTimeout(() => setShouldRender(false), TRANSITION_MS);
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

  // Focus in once the panel is actually in the DOM (the portal mounts a
  // commit after `open` flips), back out on close.
  const isShown = open && shouldRender && mounted;
  useEffect(() => {
    if (!isShown) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    // Read at close time on purpose: the fallback is whatever that ref holds then.
    const fallback = returnFocusRef;
    panelRef.current
      ?.querySelector<HTMLElement>("[data-autofocus]")
      ?.focus({ preventScroll: true });
    return () => {
      const target = previouslyFocused?.isConnected
        ? previouslyFocused
        : fallback?.current;
      target?.focus({ preventScroll: true });
    };
  }, [isShown, returnFocusRef]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (!pending) onCancel();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      );
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (
        event.shiftKey &&
        (active === first || !panelRef.current.contains(active))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (active === last || !panelRef.current.contains(active))
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, pending, onCancel]);

  if (!mounted || !shouldRender) return null;

  const state = open ? "open" : "closed";

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div
        className="note-modal-backdrop absolute inset-0 bg-[var(--cinematic)]/55 backdrop-blur-md"
        data-state={state}
        onClick={pending ? undefined : onCancel}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        aria-busy={pending}
        data-state={state}
        className="confirm-dialog note-modal-panel glass-strong relative z-10 w-full max-w-[25rem] rounded-[28px] shadow-[var(--shadow-lg)]"
      >
        {icon && (
          <span className="confirm-dialog__icon" aria-hidden="true">
            {icon}
          </span>
        )}

        <h2 id={titleId} className="text-[1.05rem] font-black leading-8">
          {title}
        </h2>

        {description && (
          <p
            id={descriptionId}
            className="mt-1.5 text-sm leading-7 text-[var(--ink-soft)]"
          >
            {description}
          </p>
        )}

        {error && (
          <p role="alert" className="confirm-dialog__error">
            <CircleAlert size={16} aria-hidden="true" />
            {error}
          </p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-2.5">
          <Button
            data-autofocus
            type="button"
            variant="ghost"
            className="confirm-dialog__cancel"
            onClick={onCancel}
            disabled={pending}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            disabled={pending}
            iconPosition="start"
          >
            {pending ? (pendingLabel ?? confirmLabel) : confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
