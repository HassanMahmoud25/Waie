"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTimestamp } from "@/lib/utils/format";
import type { EpisodeNote } from "@/types/note";

const TRANSITION_MS = 220;

/**
 * Confirms deleting a note before it's gone for good -- same portal/backdrop
 * plumbing as NoteModal/search-modal, sized down for a yes/no decision
 * instead of a form.
 */
export function NoteDeleteModal({
  note,
  onCancel,
  onConfirm,
}: {
  note: EpisodeNote | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const open = note !== null;
  const [mounted, setMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  // The note itself goes back to null the instant the parent clears the
  // selection (so `open` can flip to false immediately) -- keep the last
  // note around locally so its preview doesn't blank out mid-close-animation.
  const [displayedNote, setDisplayedNote] = useState<EpisodeNote | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (note) setDisplayedNote(note);
  }, [note]);

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
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!mounted || !shouldRender || !displayedNote) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div
        className="note-modal-backdrop absolute inset-0 bg-[var(--cinematic)]/70 backdrop-blur-md"
        data-state={open ? "open" : "closed"}
        onClick={onCancel}
        aria-hidden="true"
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-label="حذف الملاحظة"
        data-state={open ? "open" : "closed"}
        className="note-modal-panel glass-strong relative z-10 w-full max-w-xl overflow-hidden rounded-[28px] shadow-[var(--shadow-lg)]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/50 px-5 py-4">
          <h2 className="text-base font-black">حذف الملاحظة؟</h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="إغلاق"
            className="icon-btn shrink-0 !size-9"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 sm:p-5">
          <p className="text-sm leading-7 text-[var(--ink-soft)]">
            هذا الإجراء لا يمكن التراجع عنه. هل تريد حذف هذه الملاحظة نهائيًا؟
          </p>

          <div className="note-delete-preview">
            <span className="note-timestamp" aria-hidden="true">
              <MapPin size={13} aria-hidden="true" />
              {formatTimestamp(displayedNote.seconds)}
            </span>
            <p className="note-text">{displayedNote.text}</p>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onCancel}>
              إلغاء
            </Button>
            <Button type="button" variant="danger" onClick={onConfirm}>
              حذف نهائيًا
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
