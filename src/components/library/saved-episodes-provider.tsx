"use client";

import { createContext, useCallback, useContext, useMemo, useState, useTransition, type ReactNode } from "react";
import { toggleSavedEpisodeAction } from "@/lib/library/actions";

type SavedEpisodesContextValue = {
  savedEpisodeIds: string[];
  isAuthenticated: boolean;
  isSaved: (episodeId: string) => boolean;
  toggleSaved: (episodeId: string) => void;
  /** True while a toggle's Server Action call is in flight. */
  isSaving: boolean;
  /** The server's own user-facing message from the most recent failed toggle, or null. Cleared on the next toggle attempt. */
  saveError: string | null;
};

const SavedEpisodesContext = createContext<SavedEpisodesContextValue | null>(null);

/**
 * Database-backed saved-episode state, fed once from the server (see
 * (site)/layout.tsx, which fetches lib/library/saved-episodes.ts's
 * getSavedEpisodeIds() per request) and shared by every consumer via context
 * instead of each one re-fetching. A toggle updates this in-memory set
 * immediately for instant UI feedback, then calls the real Server Action and
 * reconciles to whatever it actually persisted -- so the visible state can
 * never drift from the database for more than one round trip.
 */
export function SavedEpisodesProvider({
  initialSavedEpisodeIds,
  isAuthenticated,
  children,
}: {
  initialSavedEpisodeIds: string[];
  isAuthenticated: boolean;
  children: ReactNode;
}) {
  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set(initialSavedEpisodeIds));
  const [isPending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);

  const isSaved = useCallback((episodeId: string) => savedIds.has(episodeId), [savedIds]);

  const toggleSaved = useCallback(
    (episodeId: string) => {
      // No local/anonymous fallback for saves -- callers (e.g. BookmarkButton)
      // are expected to route signed-out visitors to /login instead of calling this.
      if (!isAuthenticated) return;

      setSaveError(null);
      const wasSaved = savedIds.has(episodeId);
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.delete(episodeId);
        else next.add(episodeId);
        return next;
      });

      startTransition(async () => {
        const result = await toggleSavedEpisodeAction(episodeId);
        // Reconcile to the database's actual answer either way -- this also
        // undoes the optimistic flip if the request failed, and surfaces the
        // action's own already-safe, user-facing message (never a raw
        // server/DB error -- see toggleSavedEpisodeAction's own error
        // strings) so the revert isn't silent.
        setSavedIds((prev) => {
          const next = new Set(prev);
          const isNowSaved = result.ok ? result.saved : wasSaved;
          if (isNowSaved) next.add(episodeId);
          else next.delete(episodeId);
          return next;
        });
        if (!result.ok) setSaveError(result.error);
      });
    },
    [savedIds, isAuthenticated],
  );

  const value = useMemo<SavedEpisodesContextValue>(
    () => ({ savedEpisodeIds: [...savedIds], isAuthenticated, isSaved, toggleSaved, isSaving: isPending, saveError }),
    [savedIds, isAuthenticated, isSaved, toggleSaved, isPending, saveError],
  );

  return <SavedEpisodesContext.Provider value={value}>{children}</SavedEpisodesContext.Provider>;
}

export function useSavedEpisodesContext(): SavedEpisodesContextValue {
  const ctx = useContext(SavedEpisodesContext);
  if (!ctx) throw new Error("useSavedEpisodesContext must be used within SavedEpisodesProvider");
  return ctx;
}
