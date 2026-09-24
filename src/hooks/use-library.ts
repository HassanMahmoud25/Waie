"use client";

import { useCallback, useEffect, useState } from "react";
import { useSavedEpisodesContext } from "@/components/library/saved-episodes-provider";
import { getProgressStoreState, subscribeProgressStore, recordDbProgress, toggleDbCompleted } from "@/lib/library/progress-store";

/**
 * Shaped after the Prisma `WatchProgress` model (see prisma/schema.prisma)
 * so a real backend can later replace this hook's internals without
 * touching the components that read `ProgressEntry` values.
 */
export type ProgressEntry = {
  seconds: number;
  durationSeconds: number;
  completed: boolean;
  /** Epoch ms of the last write -- lets series-level UI pick "the episode you're currently on" as whichever has progress and the most recent timestamp. */
  updatedAt: number;
};
type LibraryState = { progress: Record<string, ProgressEntry> };

/** 0-100, clamped. Derived from the stored entry rather than re-persisted, so it can never drift from the seconds/duration it's computed from. */
export function getProgressPercent(entry: ProgressEntry | undefined): number {
  if (!entry || entry.durationSeconds <= 0) return 0;
  return Math.min(100, Math.max(0, (entry.seconds / entry.durationSeconds) * 100));
}

const STORAGE_KEY = "waie:library:v1";
const emptyState: LibraryState = { progress: {} };

/** Watching past this fraction of the episode counts as finished, same as most streaming apps -- the viewer shouldn't have to scrub to the exact last second for it to "count". */
const COMPLETE_THRESHOLD = 0.95;

function readState(): LibraryState {
  if (typeof window === "undefined") return emptyState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...emptyState, ...JSON.parse(raw) } : emptyState;
  } catch {
    return emptyState;
  }
}

function writeState(state: LibraryState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private browsing, storage full, etc. — the UI still works for this session.
  }
}

type Listener = (state: LibraryState) => void;
const listeners = new Set<Listener>();

/**
 * Every mutation goes read-fresh -> change -> write -> notify, never "change my
 * component's copy and write that". Several useLibrary() instances are mounted
 * at once (bookmark button, watched button, player), and the background audio
 * engine writes progress with no component at all; a write based on one
 * instance's older snapshot would silently erase the others' changes. Notifying
 * keeps every mounted instance showing what's actually stored.
 */
function commit(update: (base: LibraryState) => LibraryState): void {
  const base = readState();
  const next = update(base);
  if (next === base) return;
  writeState(next);
  listeners.forEach((listener) => listener(next));
}

function withProgress(base: LibraryState, episodeId: string, seconds: number, durationSeconds: number): LibraryState {
  const safeSeconds = Math.max(0, Math.round(seconds));
  const existing = base.progress[episodeId];
  const completed = (existing?.completed ?? false) || (durationSeconds > 0 && safeSeconds / durationSeconds >= COMPLETE_THRESHOLD);

  if (existing && existing.seconds === safeSeconds && existing.completed === completed && existing.durationSeconds === durationSeconds) {
    return base;
  }

  return {
    ...base,
    progress: { ...base.progress, [episodeId]: { seconds: safeSeconds, durationSeconds, completed, updatedAt: Date.now() } },
  };
}

/**
 * Hook-free read of one episode's stored progress -- called by the playback
 * engine (lib/playback/engine.ts) to compute a resume position, and by
 * getProgress() below. Authenticated visitors: the database-backed store
 * (lib/library/progress-store.ts), hydrated server-side before this can ever
 * be called -- see progress-provider.tsx. Anonymous visitors: localStorage,
 * exactly as before.
 */
export function getStoredProgress(episodeId: string): ProgressEntry | undefined {
  const dbState = getProgressStoreState();
  if (dbState.isAuthenticated) return dbState.progress[episodeId];
  return readState().progress[episodeId];
}

/**
 * Hook-free progress write for callers that outlive any component -- the
 * background audio engine keeps saving after the episode page is gone. Same
 * authenticated/anonymous split as getStoredProgress; the engine itself
 * already decides *when* to call this (throttled to ~5s plus meaningful
 * events -- see PROGRESS_SAVE_INTERVAL_MS in engine.ts), so neither branch
 * here adds its own debouncing.
 */
export function recordProgress(episodeId: string, seconds: number, durationSeconds: number): void {
  if (getProgressStoreState().isAuthenticated) {
    recordDbProgress(episodeId, seconds, durationSeconds);
    return;
  }
  commit((base) => withProgress(base, episodeId, seconds, durationSeconds));
}

/**
 * Watch progress and completion are now database-backed per signed-in
 * account too (lib/library/progress-store.ts + lib/library/actions.ts),
 * mirroring how saved episodes already work via SavedEpisodesProvider.
 * Anonymous visitors keep the original localStorage behavior completely
 * unchanged -- their progress was never, and still isn't, sent anywhere or
 * associated with any account. `waie:library:v1`'s progress data is read/
 * written exactly as before for that path; only which path an authenticated
 * visitor takes has changed.
 *
 * The hook's return shape is unchanged so existing consumers (BookmarkButton,
 * MarkWatchedButton, ContinueWatchingSection, LibraryContent, the playback
 * engine, etc.) don't need to know any of this moved.
 */
export function useLibrary() {
  const [state, setState] = useState<LibraryState>(emptyState);
  const [isLocalHydrated, setIsLocalHydrated] = useState(false);
  const [dbProgressState, setDbProgressState] = useState(getProgressStoreState);

  useEffect(() => {
    setState(readState());
    setIsLocalHydrated(true);
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  useEffect(() => subscribeProgressStore(setDbProgressState), []);

  const { savedEpisodeIds, isSaved, toggleSaved, isAuthenticated, isSaving, saveError } = useSavedEpisodesContext();

  // Authenticated: the DB store is already hydrated before first paint (see
  // ProgressProvider), so there's no wait -- unlike the anonymous path, which
  // genuinely can't read localStorage until after mount.
  const isHydrated = dbProgressState.isAuthenticated || isLocalHydrated;
  const progress = dbProgressState.isAuthenticated ? dbProgressState.progress : state.progress;

  const getProgress = useCallback((episodeId: string) => progress[episodeId], [progress]);

  /** Called from the player as an episode plays. Once real playback crosses COMPLETE_THRESHOLD it's marked completed automatically, same as the manual "mark as watched" toggle would -- but never un-marks a completion the user (or a prior watch) already set. Bails out without touching state/storage when nothing actually changed, so a player tick that reports the same second twice (e.g. right at a pause) doesn't cause a redundant re-render + localStorage write. */
  const setProgress = useCallback((episodeId: string, seconds: number, durationSeconds: number) => {
    recordProgress(episodeId, seconds, durationSeconds);
  }, []);

  const toggleCompleted = useCallback((episodeId: string) => {
    if (getProgressStoreState().isAuthenticated) {
      toggleDbCompleted(episodeId);
      return;
    }
    commit((base) => {
      const existing = base.progress[episodeId];
      return {
        ...base,
        progress: {
          ...base.progress,
          [episodeId]: {
            seconds: existing?.seconds ?? 0,
            durationSeconds: existing?.durationSeconds ?? 0,
            completed: !existing?.completed,
            updatedAt: Date.now(),
          },
        },
      };
    });
  }, []);

  return {
    isHydrated,
    savedEpisodeIds,
    progress,
    isSaved,
    toggleSaved,
    isAuthenticated,
    isSaving,
    saveError,
    getProgress,
    setProgress,
    toggleCompleted,
  };
}
