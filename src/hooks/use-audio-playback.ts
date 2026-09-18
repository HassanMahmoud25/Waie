"use client";

import { useSyncExternalStore } from "react";
import { getServerSnapshot, getSnapshot, subscribe } from "@/lib/playback/audio-engine";
import type { AudioSnapshot } from "@/lib/playback/audio-engine";

/**
 * Live view of the one background-capable audio engine (see lib/playback/audio-engine.ts).
 * Because the engine outlives every page, a component that mounts while audio is
 * already playing -- e.g. coming back to the episode after navigating away or
 * returning from another app -- immediately renders the real state instead of
 * assuming "stopped".
 */
export function useAudioPlayback(): AudioSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
