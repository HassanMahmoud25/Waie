"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, NotebookPen, Plus } from "lucide-react";
import { usePlayer } from "./player-context";
import { useEpisodeNotes } from "@/hooks/use-notes";
import { NoteCard } from "./note-card";
import { NoteComposer } from "./note-composer";
import { NoteModal } from "./note-modal";
import { NoteDeleteModal } from "./note-delete-modal";
import { EmptyState } from "@/components/content/empty-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { EpisodeNote } from "@/types/note";

type ComposerState = { mode: "add"; seconds: number } | { mode: "edit"; note: EpisodeNote } | null;

/** A list past this length starts collapsed by default -- still fully expandable via the toggle, just not dominating the page on first load. */
const AUTO_COLLAPSE_THRESHOLD = 6;

/**
 * Personal timestamped notes for the episode currently playing -- landmarks
 * the viewer drops for themselves inside the episode, not the editorial
 * series journey. Reuses the player's own getCurrentTime/seekTo (see
 * player-context.tsx) instead of tracking a second copy of playback state.
 */
export function EpisodeNotes({ episodeId, durationSeconds }: { episodeId: string; durationSeconds: number }) {
  const { getCurrentTime, seekTo } = usePlayer();
  const { isHydrated, isAuthenticated, notes, addNote, updateNote, deleteNote } = useEpisodeNotes(episodeId);
  const [composer, setComposer] = useState<ComposerState>(null);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<EpisodeNote | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const hasSetInitialCollapse = useRef(false);

  // Decide the starting state once, right when the real note count first
  // becomes known -- not on every add/delete, so the section never yanks
  // itself shut while the user is actively working in it.
  useEffect(() => {
    if (!isHydrated || hasSetInitialCollapse.current) return;
    hasSetInitialCollapse.current = true;
    setIsCollapsed(notes.length > AUTO_COLLAPSE_THRESHOLD);
  }, [isHydrated, notes.length]);

  if (!isHydrated) return null;

  const hasCollapsibleContent = isAuthenticated && notes.length > 0;
  const collapsed = hasCollapsibleContent && isCollapsed;

  const openAddComposer = () => setComposer({ mode: "add", seconds: getCurrentTime() });

  const handleJump = (note: EpisodeNote) => {
    seekTo(note.seconds);
    setActiveNoteId(note.id);
  };

  const handleSave = (seconds: number, text: string) => {
    if (composer?.mode === "edit") {
      updateNote(composer.note.id, { seconds, text });
    } else {
      addNote(seconds, text);
    }
    setComposer(null);
    // Surface the result of what they just did instead of leaving it hidden
    // behind a collapsed section.
    setIsCollapsed(false);
  };

  const handleConfirmDelete = () => {
    if (noteToDelete) deleteNote(noteToDelete.id);
    setNoteToDelete(null);
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow-pill w-fit">ملاحظاتك</p>
          <h2 className="mt-3 flex items-enter gap-2 text-xl font-black tracking-[-.02em]">
            ملاحظاتي على الحلقة
            {notes.length > 0 && <span className="note-count-badge">{notes.length}</span>}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {hasCollapsibleContent && (
            <button
              type="button"
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="note-collapse-toggle"
              aria-expanded={!collapsed}
            >
              {collapsed ? "إظهار الملاحظات" : "إخفاء الملاحظات"}
              <ChevronDown
                size={16}
                className={cn("note-collapse-toggle__chevron", !collapsed && "note-collapse-toggle__chevron--open")}
                aria-hidden="true"
              />
            </button>
          )}
          {isAuthenticated && notes.length > 0 && composer === null && (
            <Button
              variant="secondary"
              icon={<Plus size={16} aria-hidden="true" />}
              iconPosition="start"
              onClick={openAddComposer}
            >
              ملاحظة جديدة
            </Button>
          )}
        </div>
      </div>

      <div className={cn("note-panel-collapse", collapsed && "note-panel-collapse--collapsed")}>
        <div className="note-panel-collapse__inner">
          <div className="glass-panel mt-6 p-2 sm:p-3">
            {!isAuthenticated ? (
              <EmptyState
                icon={NotebookPen}
                title="سجّل الدخول لتدوين ملاحظاتك"
                description="ملاحظاتك الشخصية تبقى خاصة بحسابك وحده، وتظهر هنا عند تسجيل الدخول."
                action={
                  <Button href="/login" variant="secondary">
                    تسجيل الدخول
                  </Button>
                }
              />
            ) : (
              <>
                {notes.length > 0 && (
                  <ul className="flex flex-col gap-2">
                    {notes.map((note) =>
                      composer?.mode === "edit" && composer.note.id === note.id ? (
                        <li key={note.id} className="p-2 sm:p-1">
                          <NoteComposer
                            mode="edit"
                            initialSeconds={composer.note.seconds}
                            initialText={composer.note.text}
                            durationSeconds={durationSeconds}
                            getCurrentTime={getCurrentTime}
                            onSave={handleSave}
                            onCancel={() => setComposer(null)}
                          />
                        </li>
                      ) : (
                        <li key={note.id} className="">
                          <NoteCard
                            note={note}
                            isActive={activeNoteId === note.id}
                            onJump={() => handleJump(note)}
                            onEdit={() => setComposer({ mode: "edit", note })}
                            onRequestDelete={() => setNoteToDelete(note)}
                          />
                        </li>
                      ),
                    )}
                  </ul>
                )}

                {notes.length === 0 && composer === null && (
                  <EmptyState
                    icon={NotebookPen}
                    title="لا توجد ملاحظات بعد"
                    description="دوّن ما يستوقفك أثناء الحلقة، وارجع إليه في أي وقت."
                    action={
                      <Button
                        variant="secondary"
                        icon={<Plus size={16} aria-hidden="true" />}
                        iconPosition="start"
                        onClick={openAddComposer}
                        className="border-2 border-[#d6a861]"
                      >
                        أضف أول ملاحظة
                      </Button>
                    }
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <NoteModal
        open={composer?.mode === "add"}
        onClose={() => setComposer(null)}
        initialSeconds={composer?.mode === "add" ? composer.seconds : 0}
        durationSeconds={durationSeconds}
        getCurrentTime={getCurrentTime}
        onSave={handleSave}
      />

      <NoteDeleteModal note={noteToDelete} onCancel={() => setNoteToDelete(null)} onConfirm={handleConfirmDelete} />
    </div>
  );
}
