"use client";

import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useDialog } from "@/hooks/use-dialog";
import { NoteComposer } from "./note-composer";

/**
 * "Add note" opens here rather than inline -- a deliberate, focused moment
 * to capture a thought, separate from the page underneath. The composer
 * focuses its own textarea; the rest of the focus handling is useDialog's.
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
  const { isRendered, state, panelRef } = useDialog({ open, onClose });

  if (!isRendered) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div
        className="note-modal-backdrop absolute inset-0 bg-[var(--cinematic)]/70 backdrop-blur-md"
        data-state={state}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="ملاحظة جديدة"
        data-state={state}
        className="note-modal-panel glass-strong relative z-10 outline-none w-full max-w-lg overflow-hidden rounded-[28px] shadow-[var(--shadow-lg)]"
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
