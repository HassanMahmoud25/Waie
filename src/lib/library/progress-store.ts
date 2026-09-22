import { COMPLETE_THRESHOLD } from "@/lib/library/constants";
import { setEpisodeProgressAction, toggleEpisodeCompletedAction } from "@/lib/library/actions";
import type { WatchProgressEntry } from "@/lib/library/progress";

/**
 * Module-level (non-React) store for authenticated watch progress -- the
 * database-backed counterpart to hooks/use-library.ts's localStorage state.
 * It exists as a plain store, not a context, for the same reason
 * hooks/use-library.ts's recordProgress/getStoredProgress are plain exports:
 * the playback engine (lib/playback/engine.ts) reads and writes progress
 * from outside React entirely, so there must be a synchronously-callable,
 * hook-free API. React only reads this via useLibrary()'s subscription
 * below; it never mutates it directly.
 *
 * Only ever imported from client code (progress-provider.tsx, use-library.ts)
 * and from the engine -- never import lib/library/progress.ts's
 * getWatchProgress (a Prisma-backed function) from here.
 */
type ProgressStoreState = { progress: Record<string, WatchProgressEntry>; isAuthenticated: boolean };

let state: ProgressStoreState = { progress: {}, isAuthenticated: false };
const listeners = new Set<(state: ProgressStoreState) => void>();

function commit(next: ProgressStoreState) {
  state = next;
  listeners.forEach((listener) => listener(state));
}

/** Called once by ProgressProvider, synchronously on mount (see its own comment for why), to seed this store from the server-fetched WatchProgress rows. */
export function hydrateProgressStore(initialProgress: Record<string, WatchProgressEntry>, isAuthenticated: boolean): void {
  commit({ progress: initialProgress, isAuthenticated });
}

export function getProgressStoreState(): ProgressStoreState {
  return state;
}

export function subscribeProgressStore(listener: (state: ProgressStoreState) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * The one write path for authenticated progress, called by both
 * hooks/use-library.ts's setProgress (React) and its recordProgress
 * (hook-free, called by the playback engine). Updates the in-memory cache
 * immediately -- so every mounted consumer reflects it synchronously, exactly
 * like the localStorage path always has -- then persists to the database in
 * the background. No debouncing here: the engine already throttles calls to
 * at most once per ~5s plus discrete pause/seek/ended/visibility events (see
 * PROGRESS_SAVE_INTERVAL_MS in lib/playback/engine.ts); adding a second,
 * uncoordinated debounce layer here would only risk dropping writes the
 * engine already decided were meaningful.
 */
export function recordDbProgress(episodeId: string, seconds: number, durationSeconds: number): void {
  const existing = state.progress[episodeId];
  const completed = (existing?.completed ?? false) || (durationSeconds > 0 && seconds / durationSeconds >= COMPLETE_THRESHOLD);

  commit({
    ...state,
    progress: { ...state.progress, [episodeId]: { seconds, durationSeconds, completed, updatedAt: Date.now() } },
  });

  void setEpisodeProgressAction(episodeId, seconds, durationSeconds).then((result) => {
    if (!result.ok) console.error("Failed to persist watch progress:", result.error);
  });
}

/** Manual completion toggle (the "أنهيت الحلقة؟" button) -- optimistic, reconciled to the server's actual answer once it responds. */
export function toggleDbCompleted(episodeId: string): void {
  const existing = state.progress[episodeId];
  const optimisticCompleted = !existing?.completed;

  commit({
    ...state,
    progress: {
      ...state.progress,
      [episodeId]: {
        seconds: existing?.seconds ?? 0,
        durationSeconds: existing?.durationSeconds ?? 0,
        completed: optimisticCompleted,
        updatedAt: Date.now(),
      },
    },
  });

  void toggleEpisodeCompletedAction(episodeId).then((result) => {
    const current = state.progress[episodeId];
    if (!current) return;
    const resolvedCompleted = result.ok ? result.completed : !optimisticCompleted;
    if (resolvedCompleted === current.completed) return; // already matches -- nothing to reconcile
    commit({ ...state, progress: { ...state.progress, [episodeId]: { ...current, completed: resolvedCompleted } } });
  });
}
