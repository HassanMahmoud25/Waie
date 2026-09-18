"use client";

import { createContext, useCallback, useContext, useRef } from "react";
import type { ReactNode } from "react";

const YOUTUBE_ORIGIN = "https://www.youtube-nocookie.com";

type PlayerContextValue = {
  seekTo: (seconds: number) => void;
  /** Registers the player's root element: the YouTube iframe, or the audio surface. Used to bring the player into view on a timestamp jump, and (iframe only) as the postMessage target. */
  registerPlayer: (element: HTMLElement | null) => void;
  /** The audio engine registers how to seek itself; while set, timestamp jumps go there instead of through the YouTube iframe. */
  registerSeekHandler: (handler: ((seconds: number) => void) | null) => void;
  /** Registers the real YT.Player's getCurrentTime, kept out of this context's own state -- see MediaPlayer, which owns the actual player instance. */
  registerTimeSource: (getTime: (() => number) | null) => void;
  getCurrentTime: () => number;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

/** Read by transcript/recommendation timestamps to jump the video, and by episode notes to capture/seek to a moment (see MediaPlayer). */
export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within <EpisodePlayerProvider>");
  }
  return context;
}

/**
 * The one client boundary on the episode page: wraps the video player and
 * the knowledge tabs so a timestamp anywhere inside can seek the player via
 * the YouTube embed's postMessage API (or, for episodes with real audio, the audio
 * engine), without loading YouTube's full JS SDK.
 */
export function EpisodePlayerProvider({ children }: { children: ReactNode }) {
  const playerElementRef = useRef<HTMLElement | null>(null);
  const timeSourceRef = useRef<(() => number) | null>(null);
  const seekHandlerRef = useRef<((seconds: number) => void) | null>(null);

  const registerPlayer = useCallback((element: HTMLElement | null) => {
    playerElementRef.current = element;
  }, []);

  const registerSeekHandler = useCallback((handler: ((seconds: number) => void) | null) => {
    seekHandlerRef.current = handler;
  }, []);

  const registerTimeSource = useCallback((getTime: (() => number) | null) => {
    timeSourceRef.current = getTime;
  }, []);

  const getCurrentTime = useCallback(() => timeSourceRef.current?.() ?? 0, []);

  const seekTo = useCallback((seconds: number) => {
    const player = playerElementRef.current;

    if (seekHandlerRef.current) {
      seekHandlerRef.current(seconds);
      player?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (!(player instanceof HTMLIFrameElement) || !player.contentWindow) return;
    const iframe = player;

    const post = (func: string, args: unknown[] = []) =>
      iframe.contentWindow!.postMessage(JSON.stringify({ event: "command", func, args }), YOUTUBE_ORIGIN);

    post("seekTo", [seconds, true]);
    post("playVideo");
    iframe.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  return (
    <PlayerContext.Provider value={{ seekTo, registerPlayer, registerSeekHandler, registerTimeSource, getCurrentTime }}>
      {children}
    </PlayerContext.Provider>
  );
}
