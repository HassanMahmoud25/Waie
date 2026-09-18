"use client";

import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { NoteTimestamp } from "./note-timestamp";
import type { EpisodeNote } from "@/types/note";

/** One personal note row: timestamp anchor, text, and quiet edit/delete actions. Deleting opens a confirmation modal (see NoteDeleteModal) rather than deleting straight away. */
export function NoteCard({
  note,
  isActive,
  onJump,
  onEdit,
  onRequestDelete,
}: {
  note: EpisodeNote;
  isActive: boolean;
  onJump: () => void;
  onEdit: () => void;
  onRequestDelete: () => void;
}) {
  return (
    <div className={cn("note-row", isActive && "note-row--active")}>
      <NoteTimestamp seconds={note.seconds} onClick={onJump} />
      <p className="note-text">{note.text}</p>
      <div className="note-actions">
        <button type="button" onClick={onEdit} className="note-action-btn" aria-label="تعديل الملاحظة">
          <Pencil size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onRequestDelete}
          className="note-action-btn note-action-btn--danger"
          aria-label="حذف الملاحظة"
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
