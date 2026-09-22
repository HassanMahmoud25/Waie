"use client";

import { useState, type ReactNode } from "react";
import { hydrateProgressStore } from "@/lib/library/progress-store";
import type { WatchProgressEntry } from "@/lib/library/progress";

/**
 * Seeds the module-level progress store (lib/library/progress-store.ts) from
 * server-fetched WatchProgress rows. Deliberately not a Context -- the
 * playback engine reads/writes progress from outside React entirely, so the
 * store has to be a plain module, not something distributed via
 * React.createContext. This component's only job is to get server data into
 * that module before anything reads it.
 *
 * Hydration happens inside a `useState` lazy initializer rather than a
 * `useEffect`: an effect runs after the first paint, which would leave a
 * brief window where the store still reports {progress:{}, isAuthenticated:
 * false} to anything that asks (mark-watched button, continue-watching,
 * or the engine's own resume-position lookup) -- effectively the same
 * "flash of wrong state" this project already ruled out for
 * SavedEpisodesProvider. The lazy initializer runs synchronously during this
 * component's first render, and since React renders parents (this one, from
 * (site)/layout.tsx) before the children that could possibly read progress,
 * nothing ever observes the un-hydrated default.
 */
export function ProgressProvider({
  initialProgress,
  isAuthenticated,
  children,
}: {
  initialProgress: Record<string, WatchProgressEntry>;
  isAuthenticated: boolean;
  children: ReactNode;
}) {
  useState(() => {
    hydrateProgressStore(initialProgress, isAuthenticated);
    return null;
  });

  return <>{children}</>;
}
