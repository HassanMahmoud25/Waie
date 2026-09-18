"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { NoteComposer } from "./note-composer";

const TRANSITION_MS = 220;

/**
 * "Add note" opens here rather than inline -- a deliberate, focused moment
 * to capture a thought, separate from the page underneath. Mirrors the
 * portal/backdrop/animation plumbing of components/search/search-modal.tsx
 * so both modals feel like the same product.
 */
export function NoteModal({
  open,
  onClose,
  initialSeconds,
  durationSeconds,
  getCurrentTime,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initialSeconds: number;
  durationSeconds: number;
  getCurrentTime: () => number;
  onSave: (seconds: number, text: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  // Keeps the modal in the DOM for the closing animation; the CSS drives the
  // open/close animation itself off the `data-state` attribute (see the
  // `.note-modal-*` keyframes in globals.css).
  const [shouldRender, setShouldRender] = useState(false);

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

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!mounted || !shouldRender) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div
        className="note-modal-backdrop absolute inset-0 bg-[var(--cinematic)]/70 backdrop-blur-md"
        data-state={open ? "open" : "closed"}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="ملاحظة جديدة"
        data-state={open ? "open" : "closed"}
        className="note-modal-panel glass-strong relative z-10 w-full max-w-lg overflow-hidden rounded-[28px] shadow-[var(--shadow-lg)]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/50 px-5 py-4">
          <h2 className="text-base font-black">ملاحظة جديدة</h2>
          <button type="button" onClick={onClose} aria-label="إغلاق" className="icon-btn shrink-0 !size-9">
            <X size={16} />
          </button>
        </div>

        <div className="p-3 sm:p-4">
          <NoteComposer
            mode="add"
            initialSeconds={initialSeconds}
            durationSeconds={durationSeconds}
            getCurrentTime={getCurrentTime}
            onSave={onSave}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
