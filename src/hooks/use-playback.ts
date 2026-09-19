"use client";

import { useSyncExternalStore } from "react";
import {
  getServerSnapshot,
  getServerTimeSnapshot,
  getSnapshot,
  getTimeSnapshot,
  subscribe,
  subscribeTime,
} from "@/lib/playback/engine";
import type { PlaybackSnapshot } from "@/lib/playback/engine";

/**
 * Live view of the one media engine (lib/playback/engine.ts). Because the
 * engine outlives every page, a component that mounts while media is already
 * playing -- coming back to the episode after navigating away, say --
 * immediately renders the real state instead of assuming "stopped".
 *
 * Deliberately excludes the playback position: use usePlaybackTime() only in
 * the components that actually draw it, so a ticking clock doesn't re-render
 * titles and buttons.
 */
export function usePlayback(): PlaybackSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** The playback position in whole seconds, updating once a second while playing. */
export function usePlaybackTime(): number {
  return useSyncExternalStore(subscribeTime, getTimeSnapshot, getServerTimeSnapshot);
}
