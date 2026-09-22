"use client";

import { createContext, useCallback, useContext, useMemo, useState, useTransition, type ReactNode } from "react";
import type { EpisodeNote } from "@/types/note";
import { createNoteAction, updateNoteAction, deleteNoteAction } from "@/lib/library/actions";

type NotesContextValue = {
  notes: EpisodeNote[];
  isAuthenticated: boolean;
  addNote: (episodeId: string, seconds: number, text: string) => void;
  updateNote: (noteId: string, changes: { seconds?: number; text?: string }) => void;
  deleteNote: (noteId: string) => void;
};

const NotesContext = createContext<NotesContextValue | null>(null);

/**
 * Database-backed notes, fed once from the server ((site)/layout.tsx calls
 * lib/library/notes.ts's getUserNotes()) and shared via context -- a plain
 * React Context, not the plain-module bridge SavedEpisodes/Progress use,
 * because notes are only ever read/written from React components
 * (components/episode/episode-notes.tsx); nothing outside React needs
 * synchronous access the way the playback engine needs progress.
 *
 * Optimistic UI: add/update/delete update local state immediately, then
 * call the real Server Action and reconcile -- a temp client-side id stands
 * in for a new note until the server assigns the real one; a failed
 * mutation reverts to the last known-good snapshot.
 */
export function NotesProvider({
  initialNotes,
  isAuthenticated,
  children,
}: {
  initialNotes: EpisodeNote[];
  isAuthenticated: boolean;
  children: ReactNode;
}) {
  const [notes, setNotes] = useState<EpisodeNote[]>(initialNotes);
  const [, startTransition] = useTransition();

  const addNote = useCallback(
    (episodeId: string, seconds: number, text: string) => {
      if (!isAuthenticated) return;

      const tempId = `temp-${crypto.randomUUID()}`;
      const now = new Date().toISOString();
      // userId is a placeholder here -- nothing reads it for an optimistic row (see
      // hooks/use-notes.ts, which filters context notes by episodeId only); it's
      // replaced by the real value the instant the server responds.
      const optimisticNote: EpisodeNote = { id: tempId, userId: "", episodeId, seconds, text, createdAt: now, updatedAt: now };
      setNotes((prev) => [...prev, optimisticNote]);

      startTransition(async () => {
        const result = await createNoteAction(episodeId, seconds, text);
        setNotes((prev) => {
          if (!result.ok) return prev.filter((note) => note.id !== tempId);
          return prev.map((note) => (note.id === tempId ? result.note : note));
        });
      });
    },
    [isAuthenticated],
  );

  const updateNote = useCallback(
    (noteId: string, changes: { seconds?: number; text?: string }) => {
      if (!isAuthenticated) return;

      let previous: EpisodeNote[] = [];
      setNotes((prev) => {
        previous = prev;
        return prev.map((note) =>
          note.id === noteId
            ? {
                ...note,
                ...(changes.seconds !== undefined ? { seconds: changes.seconds } : {}),
                ...(changes.text !== undefined ? { text: changes.text } : {}),
                updatedAt: new Date().toISOString(),
              }
            : note,
        );
      });

      startTransition(async () => {
        const result = await updateNoteAction(noteId, changes);
        if (!result.ok) {
          setNotes(previous);
          return;
        }
        setNotes((prev) => prev.map((note) => (note.id === noteId ? result.note : note)));
      });
    },
    [isAuthenticated],
  );

  const deleteNote = useCallback(
    (noteId: string) => {
      if (!isAuthenticated) return;

      let previous: EpisodeNote[] = [];
      setNotes((prev) => {
        previous = prev;
        return prev.filter((note) => note.id !== noteId);
      });

      startTransition(async () => {
        const result = await deleteNoteAction(noteId);
        if (!result.ok) setNotes(previous);
      });
    },
    [isAuthenticated],
  );

  const value = useMemo<NotesContextValue>(
    () => ({ notes, isAuthenticated, addNote, updateNote, deleteNote }),
    [notes, isAuthenticated, addNote, updateNote, deleteNote],
  );

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotesContext(): NotesContextValue {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error("useNotesContext must be used within NotesProvider");
  return ctx;
}
