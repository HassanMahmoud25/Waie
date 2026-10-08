"use client";

import { useId, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { CircleAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { useDialog } from "@/hooks/use-dialog";

/**
 * A compact yes/no confirmation (focus and Escape handling: useDialog).
 * Cancel gets focus on open -- the safe default.
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
  const titleId = useId();
  const descriptionId = useId();
  const { isRendered, state, panelRef } = useDialog({ open, onClose: onCancel, canClose: !pending, returnFocusRef });

  if (!isRendered) return null;

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
        tabIndex={-1}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        aria-busy={pending}
        data-state={state}
        className="confirm-dialog note-modal-panel glass-strong relative outline-none z-10 w-full max-w-[25rem] rounded-[28px] shadow-[var(--shadow-lg)]"
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
          {/* The label stays in the layout (just invisible) while pending and
              the spinner is overlaid, so the button never resizes or wraps;
              the pending text is announced to screen readers instead. */}
          <Button
            type="button"
            variant="danger"
            className="confirm-dialog__confirm"
            data-pending={pending || undefined}
            onClick={onConfirm}
            disabled={pending}
          >
            <span className="confirm-dialog__label">{confirmLabel}</span>
            {pending && (
              <>
                <span className="confirm-dialog__spinner" aria-hidden="true">
                  <Loader2 className="animate-spin" size={18} />
                </span>
                <VisuallyHidden>{pendingLabel ?? confirmLabel}</VisuallyHidden>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
