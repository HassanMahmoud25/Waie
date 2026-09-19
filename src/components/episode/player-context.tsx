"use client";

import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { getPlaybackTime, getSlotElement, getSnapshot, jumpTo } from "@/lib/playback/engine";
import type { MediaItem } from "@/lib/playback/item";

type PlayerContextValue = {
  /** Plays this episode from `seconds`, in whichever mode its page is showing, and brings the player into view. */
  seekTo: (seconds: number) => void;
  /** Where this episode's playback is right now, or 0 if it isn't the one the player holds. */
  getCurrentTime: () => number;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

/** Read by transcript/recommendation timestamps to jump the player, and by episode notes to capture/seek to a moment. */
export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within <EpisodePlayerProvider>");
  }
  return context;
}

/**
 * The one client boundary on the episode page: gives the knowledge tabs and
 * notes a way to talk to the player for *this* episode. There's no player
 * state here -- playback lives in the global engine (lib/playback/engine.ts),
 * which is why a timestamp works the same whether the video, the audio, or
 * neither is currently playing.
 */
export function EpisodePlayerProvider({ item, children }: { item: MediaItem; children: ReactNode }) {
  const value = useMemo<PlayerContextValue>(
    () => ({
      seekTo: (seconds) => {
        jumpTo(item, seconds);
        getSlotElement()?.scrollIntoView({ behavior: "smooth", block: "center" });
      },
      getCurrentTime: () => (getSnapshot().item?.episodeId === item.episodeId ? getPlaybackTime() : 0),
    }),
    [item],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}
