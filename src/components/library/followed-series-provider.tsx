"use client";

import { createContext, useCallback, useContext, useMemo, useState, useTransition, type ReactNode } from "react";
import { toggleFollowedSeriesAction } from "@/lib/library/actions";

type FollowedSeriesContextValue = {
  followedSeriesIds: string[];
  isAuthenticated: boolean;
  isFollowed: (seriesId: string) => boolean;
  toggleFollowed: (seriesId: string) => void;
  /** True while a toggle's Server Action call is in flight. */
  isToggling: boolean;
  /** The server's own user-facing message from the most recent failed toggle, or null. Cleared on the next toggle attempt. */
  followError: string | null;
};

const FollowedSeriesContext = createContext<FollowedSeriesContextValue | null>(null);

/**
 * Database-backed followed-series state, fed once from the server (see
 * (site)/layout.tsx, which fetches lib/library/followed-series.ts's
 * getFollowedSeriesIds() per request) and shared by every consumer via
 * context instead of each one re-fetching. A toggle updates this in-memory
 * set immediately for instant UI feedback, then calls the real Server
 * Action and reconciles to whatever it actually persisted -- so the visible
 * state can never drift from the database for more than one round trip.
 *
 * Mirrors SavedEpisodesProvider exactly -- same shape, same reconciliation
 * strategy, same "no anonymous fallback" rule.
 */
export function FollowedSeriesProvider({
  initialFollowedSeriesIds,
  isAuthenticated,
  children,
}: {
  initialFollowedSeriesIds: string[];
  isAuthenticated: boolean;
  children: ReactNode;
}) {
  const [followedIds, setFollowedIds] = useState<Set<string>>(() => new Set(initialFollowedSeriesIds));
  const [isPending, startTransition] = useTransition();
  const [followError, setFollowError] = useState<string | null>(null);

  const isFollowed = useCallback((seriesId: string) => followedIds.has(seriesId), [followedIds]);

  const toggleFollowed = useCallback(
    (seriesId: string) => {
      // No local/anonymous fallback for follows -- callers (e.g. FollowSeriesButton)
      // are expected to route signed-out visitors to /login instead of calling this.
      if (!isAuthenticated) return;

      setFollowError(null);
      const wasFollowed = followedIds.has(seriesId);
      setFollowedIds((prev) => {
        const next = new Set(prev);
        if (wasFollowed) next.delete(seriesId);
        else next.add(seriesId);
        return next;
      });

      startTransition(async () => {
        const result = await toggleFollowedSeriesAction(seriesId);
        // Reconcile to the database's actual answer either way -- this also
        // undoes the optimistic flip if the request failed, and surfaces the
        // action's own already-safe, user-facing message (never a raw
        // server/DB error) so the revert isn't silent.
        setFollowedIds((prev) => {
          const next = new Set(prev);
          const isNowFollowed = result.ok ? result.following : wasFollowed;
          if (isNowFollowed) next.add(seriesId);
          else next.delete(seriesId);
          return next;
        });
        if (!result.ok) setFollowError(result.error);
      });
    },
    [followedIds, isAuthenticated],
  );

  const value = useMemo<FollowedSeriesContextValue>(
    () => ({ followedSeriesIds: [...followedIds], isAuthenticated, isFollowed, toggleFollowed, isToggling: isPending, followError }),
    [followedIds, isAuthenticated, isFollowed, toggleFollowed, isPending, followError],
  );

  return <FollowedSeriesContext.Provider value={value}>{children}</FollowedSeriesContext.Provider>;
}

export function useFollowedSeriesContext(): FollowedSeriesContextValue {
  const ctx = useContext(FollowedSeriesContext);
  if (!ctx) throw new Error("useFollowedSeriesContext must be used within FollowedSeriesProvider");
  return ctx;
}
