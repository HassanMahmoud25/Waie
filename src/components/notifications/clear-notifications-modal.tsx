"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Confirms wiping the signed-in user's entire notification history before
 * doing it -- same portal/backdrop/animation plumbing as NoteDeleteModal
 * (episode notes), reused here rather than re-invented.
 */
export function ClearNotificationsModal({
  open,
  pending,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      return;
    }
    const timeout = setTimeout(() => setShouldRender(false), 220);
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

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!mounted || !shouldRender) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div
        className="note-modal-backdrop absolute inset-0 bg-[var(--cinematic)]/70 backdrop-blur-md"
        data-state={open ? "open" : "closed"}
        onClick={pending ? undefined : onCancel}
        aria-hidden="true"
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-label="حذف كل الإشعارات"
        data-state={open ? "open" : "closed"}
        className="note-modal-panel glass-strong relative z-10 w-full max-w-xl overflow-hidden rounded-[28px] shadow-[var(--shadow-lg)]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/50 px-5 py-4">
          <h2 className="text-base font-black">حذف كل الإشعارات؟</h2>
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            aria-label="إغلاق"
            className="icon-btn shrink-0 !size-9 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 sm:p-5">
          <p className="text-sm leading-7 text-[var(--ink-soft)]">
            سيؤدي هذا إلى حذف جميع إشعاراتك نهائيًا، المقروءة وغير المقروءة، ولا يمكن التراجع عن هذا الإجراء.
          </p>

          <div className="mt-5 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
              إلغاء
            </Button>
            <Button type="button" variant="danger" onClick={onConfirm} disabled={pending}>
              {pending ? "جارٍ الحذف..." : "حذف الكل نهائيًا"}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
