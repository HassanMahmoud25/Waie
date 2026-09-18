"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./use-auth";
import type { EpisodeNote } from "@/types/note";

const STORAGE_KEY = "waie:notes:v1";

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
 * Local, per-device stand-in for a real account: personal timestamped notes
 * persisted to localStorage, keyed to the signed-in user (see hooks/use-auth.ts)
 * so one browser shared by two accounts never leaks one user's notes into the
 * other's list. Shaped like the Note Prisma model already in the schema, so
 * wiring a real backend later means swapping this hook's internals, not the
 * components that call it.
 */
export function useEpisodeNotes(episodeId: string) {
  const { isHydrated: isAuthHydrated, user } = useAuth();
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

  const userId = user?.id;

  // Chronological by timestamp (not creation order) -- a note added at 20:00
  // after one already at 51:30 still lands before it in the list.
  const notes = userId
    ? allNotes
        .filter((note) => note.userId === userId && note.episodeId === episodeId)
        .sort((a, b) => a.seconds - b.seconds)
    : [];

  const addNote = useCallback(
    (seconds: number, text: string) => {
      if (!userId) return;
      const trimmed = text.trim();
      if (!trimmed) return;

      const now = new Date().toISOString();
      const note: EpisodeNote = {
        id: crypto.randomUUID(),
        userId,
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
    [userId, episodeId],
  );

  const updateNote = useCallback(
    (id: string, changes: { seconds?: number; text?: string }) => {
      setAllNotes((prev) => {
        let changed = false;
        const next = prev.map((note) => {
          if (note.id !== id || note.userId !== userId) return note;
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
    },
    [userId],
  );

  const deleteNote = useCallback(
    (id: string) => {
      setAllNotes((prev) => {
        const next = prev.filter((note) => !(note.id === id && note.userId === userId));
        if (next.length === prev.length) return prev;
        writeAll(next);
        return next;
      });
    },
    [userId],
  );

  return {
    isHydrated: isAuthHydrated && isStorageHydrated,
    isAuthenticated: Boolean(userId),
    notes,
    addNote,
    updateNote,
    deleteNote,
  };
}
