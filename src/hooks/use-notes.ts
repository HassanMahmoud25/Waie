"use client";

import { useCallback, useEffect, useState } from "react";
import { useNotesContext } from "@/components/library/notes-provider";
import type { EpisodeNote } from "@/types/note";

const STORAGE_KEY = "waie:notes:v1";
/** Anonymous local notes have no real account behind them -- every note in this browser's storage shares this placeholder so EpisodeNote's shape stays the same as the DB-backed path. Never read for rendering (see note-card.tsx etc.), only kept for shape parity. */
const ANONYMOUS_USER_ID = "anonymous";

function readAll(): EpisodeNote[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(notes: EpisodeNote[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // Private browsing, storage full, etc. — the UI still works for this session.
  }
}

/**
 * Notes are database-backed for real signed-in accounts (see
 * lib/library/notes.ts + lib/library/actions.ts + NotesProvider). Anonymous
 * visitors keep the original localStorage behavior, scoped only to this
 * browser -- there is no "local account" concept to further split by
 * anymore (the old useAuth()-based demo auth layer was removed entirely;
 * nothing creates a distinct local identity today, so every anonymous note
 * in this browser's storage is simply "this browser's").
 *
 * Every hook below is called unconditionally on every render (both the
 * local-storage machinery and useNotesContext()); only the *return value*
 * branches on whether there's a real session, so this never violates the
 * Rules of Hooks.
 */
export function useEpisodeNotes(episodeId: string) {
  const [allNotes, setAllNotes] = useState<EpisodeNote[]>([]);
  const [isStorageHydrated, setIsStorageHydrated] = useState(false);

  useEffect(() => {
    setAllNotes(readAll());
    setIsStorageHydrated(true);
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setAllNotes(readAll());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Chronological by timestamp (not creation order) -- a note added at 20:00
  // after one already at 51:30 still lands before it in the list.
  const localNotes = allNotes.filter((note) => note.episodeId === episodeId).sort((a, b) => a.seconds - b.seconds);

  const addLocalNote = useCallback(
    (seconds: number, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const now = new Date().toISOString();
      const note: EpisodeNote = {
        id: crypto.randomUUID(),
        userId: ANONYMOUS_USER_ID,
        episodeId,
        seconds: Math.max(0, Math.round(seconds)),
        text: trimmed,
        createdAt: now,
        updatedAt: now,
      };
      setAllNotes((prev) => {
        const next = [...prev, note];
        writeAll(next);
        return next;
      });
    },
    [episodeId],
  );

  const updateLocalNote = useCallback((id: string, changes: { seconds?: number; text?: string }) => {
    setAllNotes((prev) => {
      let changed = false;
      const next = prev.map((note) => {
        if (note.id !== id) return note;
        const text = changes.text !== undefined ? changes.text.trim() : note.text;
        if (!text) return note;
        changed = true;
        return {
          ...note,
          seconds: changes.seconds !== undefined ? Math.max(0, Math.round(changes.seconds)) : note.seconds,
          text,
          updatedAt: new Date().toISOString(),
        };
      });
      if (!changed) return prev;
      writeAll(next);
      return next;
    });
  }, []);

  const deleteLocalNote = useCallback((id: string) => {
    setAllNotes((prev) => {
      const next = prev.filter((note) => note.id !== id);
      if (next.length === prev.length) return prev;
      writeAll(next);
      return next;
    });
  }, []);

  const db = useNotesContext();
  const dbNotesForEpisode = db.notes.filter((note) => note.episodeId === episodeId).sort((a, b) => a.seconds - b.seconds);
  const addDbNote = useCallback((seconds: number, text: string) => db.addNote(episodeId, seconds, text), [db, episodeId]);

  if (db.isAuthenticated) {
    return {
      // The DB store is hydrated server-side before first paint (see NotesProvider) --
      // no localStorage-style wait, and no flash of an empty list.
      isHydrated: true,
      isAuthenticated: true,
      notes: dbNotesForEpisode,
      addNote: addDbNote,
      updateNote: db.updateNote,
      deleteNote: db.deleteNote,
    };
  }

  return {
    isHydrated: isStorageHydrated,
    isAuthenticated: false,
    notes: localNotes,
    addNote: addLocalNote,
    updateNote: updateLocalNote,
    deleteNote: deleteLocalNote,
  };
}
