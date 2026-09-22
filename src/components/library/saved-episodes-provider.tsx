"use client";

import { createContext, useCallback, useContext, useMemo, useState, useTransition, type ReactNode } from "react";
import { toggleSavedEpisodeAction } from "@/lib/library/actions";

type SavedEpisodesContextValue = {
  savedEpisodeIds: string[];
  isAuthenticated: boolean;
  isSaved: (episodeId: string) => boolean;
  toggleSaved: (episodeId: string) => void;
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
  const [, startTransition] = useTransition();

  const isSaved = useCallback((episodeId: string) => savedIds.has(episodeId), [savedIds]);

  const toggleSaved = useCallback(
    (episodeId: string) => {
      // No local/anonymous fallback for saves -- callers (e.g. BookmarkButton)
      // are expected to route signed-out visitors to /login instead of calling this.
      if (!isAuthenticated) return;

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
        // silently undoes the optimistic flip if the request failed.
        setSavedIds((prev) => {
          const next = new Set(prev);
          const isNowSaved = result.ok ? result.saved : wasSaved;
          if (isNowSaved) next.add(episodeId);
          else next.delete(episodeId);
          return next;
        });
      });
    },
    [savedIds, isAuthenticated],
  );

  const value = useMemo<SavedEpisodesContextValue>(
    () => ({ savedEpisodeIds: [...savedIds], isAuthenticated, isSaved, toggleSaved }),
    [savedIds, isAuthenticated, isSaved, toggleSaved],
  );

  return <SavedEpisodesContext.Provider value={value}>{children}</SavedEpisodesContext.Provider>;
}

export function useSavedEpisodesContext(): SavedEpisodesContextValue {
  const ctx = useContext(SavedEpisodesContext);
  if (!ctx) throw new Error("useSavedEpisodesContext must be used within SavedEpisodesProvider");
  return ctx;
}
