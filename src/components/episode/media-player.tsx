"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePlayer } from "./player-context";
import { AudioPlayerSurface } from "./audio-player-surface";
import { useLibrary } from "@/hooks/use-library";
import { pausePlayback } from "@/lib/playback/audio-engine";
import { getResumePosition, type PlaybackNeighbors, type PlaybackTrack } from "@/lib/playback/track";

/** How often to persist watch progress while the video is actively playing. */
const PROGRESS_SAVE_INTERVAL_MS = 5000;

type YTPlayerInstance = {
  getCurrentTime: () => number;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  destroy: () => void;
};

type YTStateChangeEvent = { data: number };

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement,
        options: {
          events?: {
            onReady?: () => void;
            onStateChange?: (event: YTStateChangeEvent) => void;
          };
        },
      ) => YTPlayerInstance;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

/** YouTube's "playing" player state (see the IFrame Player API's onStateChange). */
const PLAYING = 1;

let iframeApiPromise: Promise<NonNullable<Window["YT"]>> | null = null;

/**
 * Loads YouTube's small IFrame Player API script once per page (cached
 * across every MediaPlayer instance) so we can read real playback position
 * via the official onStateChange/getCurrentTime API instead of guessing at
 * the embed's undocumented postMessage traffic. This is separate from --
 * and doesn't interfere with -- the raw seekTo/playVideo postMessage calls
 * in player-context.tsx, which keep working unchanged for transcript jumps.
 */
function loadYouTubeIframeApi(): Promise<NonNullable<Window["YT"]>> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (iframeApiPromise) return iframeApiPromise;

  iframeApiPromise = new Promise((resolve) => {
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      resolve(window.YT!);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
  });
  return iframeApiPromise;
}

/**
 * The episode page's one player. Which engine is behind it depends on the
 * episode: with an owner-supplied audio file it's the HTML5 audio engine (the
 * only kind that can keep playing in the background and show lock-screen
 * controls); otherwise it's the YouTube embed, exactly as before. YouTube's
 * developer policies forbid background players and separating a video's audio,
 * so an embed can't be made to do this -- and audio is never pulled from
 * YouTube to work around that.
 */
export function MediaPlayer({
  audioTrack,
  adjacentTracks,
  ...youtube
}: {
  videoId: string;
  title: string;
  episodeId: string;
  durationSeconds: number;
  audioTrack?: PlaybackTrack | null;
  /** Previous/next episodes in the series that have audio too, for the lock screen's skip buttons. */
  adjacentTracks?: PlaybackNeighbors;
}) {
  if (audioTrack) {
    return <AudioPlayerSurface track={audioTrack} neighbors={adjacentTracks ?? { previous: null, next: null }} />;
  }
  return <YouTubeEmbed {...youtube} />;
}

function YouTubeEmbed({
  videoId,
  title,
  episodeId,
  durationSeconds,
}: {
  videoId: string;
  title: string;
  episodeId: string;
  durationSeconds: number;
}) {
  const { registerPlayer, registerTimeSource } = usePlayer();
  const { isHydrated, progress, setProgress } = useLibrary();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const ytPlayerRef = useRef<YTPlayerInstance | null>(null);

  // Resuming needs the latest hydrated progress at whatever moment the
  // player actually finishes loading, which can land before *or* after
  // hydration -- refs sidestep the stale closure the mount effect below
  // would otherwise capture over `progress`/`isHydrated`.
  const progressRef = useRef(progress);
  const isHydratedRef = useRef(isHydrated);
  const playerReadyRef = useRef(false);
  const hasResumedRef = useRef(false);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);
  useEffect(() => {
    isHydratedRef.current = isHydrated;
  }, [isHydrated]);

  const attemptResume = useCallback(() => {
    if (hasResumedRef.current || !isHydratedRef.current || !playerReadyRef.current) return;
    hasResumedRef.current = true;

    const resumeAt = getResumePosition(progressRef.current[episodeId], durationSeconds);
    if (resumeAt !== null) ytPlayerRef.current?.seekTo(resumeAt, true);
  }, [episodeId, durationSeconds]);

  // Hydration can finish after the player is already ready (script load is
  // usually the slower of the two, but not guaranteed) -- re-check here too.
  useEffect(() => {
    attemptResume();
  }, [isHydrated, attemptResume]);

  useEffect(() => {
    let cancelled = false;
    let saveIntervalId: ReturnType<typeof setInterval> | null = null;

    const stopInterval = () => {
      if (saveIntervalId !== null) {
        clearInterval(saveIntervalId);
        saveIntervalId = null;
      }
    };

    const saveProgress = () => {
      const seconds = ytPlayerRef.current?.getCurrentTime();
      if (typeof seconds === "number" && seconds > 0) {
        setProgress(episodeId, seconds, durationSeconds);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) saveProgress();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    registerTimeSource(() => ytPlayerRef.current?.getCurrentTime() ?? 0);

    loadYouTubeIframeApi().then((YT) => {
      if (cancelled || !iframeRef.current) return;
      ytPlayerRef.current = new YT.Player(iframeRef.current, {
        events: {
          onReady: () => {
            playerReadyRef.current = true;
            attemptResume();
          },
          onStateChange: (event) => {
            stopInterval();
            if (event.data === PLAYING) {
              // One thing plays at a time: if audio from another episode was still going in the background, this takes over.
              pausePlayback();
              saveIntervalId = setInterval(saveProgress, PROGRESS_SAVE_INTERVAL_MS);
            } else {
              saveProgress();
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      registerTimeSource(null);
      stopInterval();
      saveProgress();
      try {
        ytPlayerRef.current?.destroy();
      } catch {
        // Player never finished initializing -- nothing to tear down.
      }
      ytPlayerRef.current = null;
    };
  }, [episodeId, durationSeconds, setProgress, attemptResume, registerTimeSource]);

  return (
    <div className="aspect-video overflow-hidden bg-black">
      <iframe
        ref={(el) => {
          registerPlayer(el);
          iframeRef.current = el;
        }}
        className="size-full"
        src={`https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
