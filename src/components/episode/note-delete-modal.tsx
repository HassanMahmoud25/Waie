"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTimestamp } from "@/lib/utils/format";
import { useDialog } from "@/hooks/use-dialog";
import type { EpisodeNote } from "@/types/note";

/**
 * Confirms deleting a note before it's gone for good, with a preview of the
 * note (focus and Escape handling: useDialog).
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
  // The note itself goes back to null the instant the parent clears the
  // selection (so `open` can flip to false immediately) -- keep the last
  // note around locally so its preview doesn't blank out mid-close-animation.
  const [displayedNote, setDisplayedNote] = useState<EpisodeNote | null>(null);

  useEffect(() => {
    if (note) setDisplayedNote(note);
  }, [note]);

  const { isRendered, state, panelRef } = useDialog({ open, onClose: onCancel });

  if (!isRendered || !displayedNote) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div
        className="note-modal-backdrop absolute inset-0 bg-[var(--cinematic)]/70 backdrop-blur-md"
        data-state={state}
        onClick={onCancel}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        role="alertdialog"
        aria-modal="true"
        aria-label="حذف الملاحظة"
        data-state={state}
        className="note-modal-panel glass-strong relative z-10 outline-none w-full max-w-xl overflow-hidden rounded-[28px] shadow-[var(--shadow-lg)]"
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
            <Button type="button" variant="ghost" onClick={onCancel} data-autofocus>
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
