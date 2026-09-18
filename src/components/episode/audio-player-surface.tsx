"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, Pause, Play, RotateCcw, RotateCw } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { useAudioPlayback } from "@/hooks/use-audio-playback";
import { useLibrary } from "@/hooks/use-library";
import { getPlaybackTime, getSnapshot, pausePlayback, playTrack, seekBy, seekTo, syncNeighbors } from "@/lib/playback/audio-engine";
import { DEFAULT_SEEK_OFFSET_SECONDS } from "@/lib/playback/media-session";
import { getResumePosition } from "@/lib/playback/track";
import type { PlaybackNeighbors, PlaybackTrack } from "@/lib/playback/track";
import { formatTimestamp } from "@/lib/utils/format";
import { usePlayer } from "./player-context";

/**
 * The episode player's face for episodes that have real audio: the same
 * 16:9 frame the YouTube embed sits in, showing the episode's thumbnail with
 * play / skip / seek controls. It holds no playback state of its own -- the
 * audio lives in the engine (lib/playback/audio-engine.ts), which keeps playing
 * when this unmounts, so this only mirrors the engine and sends it commands.
 */
export function AudioPlayerSurface({ track, neighbors }: { track: PlaybackTrack; neighbors: PlaybackNeighbors }) {
  const { registerPlayer, registerSeekHandler, registerTimeSource } = usePlayer();
  const { isHydrated, progress } = useLibrary();
  const playback = useAudioPlayback();
  const [scrubTime, setScrubTime] = useState<number | null>(null);

  // The engine plays one episode at a time; every other episode's page just shows its saved position.
  const isCurrent = playback.track?.episodeId === track.episodeId;
  const isPlaying = isCurrent && playback.isPlaying;
  const isBuffering = isCurrent && playback.isPlaying && playback.isBuffering;
  const hasError = isCurrent && playback.hasError;
  const duration = isCurrent ? playback.duration : track.durationSeconds;
  const savedPosition = isHydrated ? (getResumePosition(progress[track.episodeId], track.durationSeconds) ?? 0) : 0;
  const currentTime = isCurrent ? playback.currentTime : savedPosition;
  const shownTime = Math.min(scrubTime ?? currentTime, duration);

  // Transcript/notes timestamps and note capture talk to the player through
  // context; point them at the engine. Read the engine (not this render's
  // values) at call time so they never see a stale closure.
  useEffect(() => {
    registerTimeSource(() => (getSnapshot().track?.episodeId === track.episodeId ? getPlaybackTime() : 0));
    registerSeekHandler((seconds) => playTrack(track, neighbors, seconds));
    // If this episode is what's already playing (coming back to its page), make sure
    // the lock screen's previous/next match this page's series neighbours.
    syncNeighbors(track.episodeId, neighbors);
    return () => {
      registerTimeSource(null);
      registerSeekHandler(null);
    };
  }, [track, neighbors, registerTimeSource, registerSeekHandler]);

  const togglePlay = () => {
    if (isPlaying) pausePlayback();
    else playTrack(track, neighbors);
  };

  const skip = (deltaSeconds: number) => {
    if (isCurrent) seekBy(deltaSeconds);
    else playTrack(track, neighbors, Math.max(0, currentTime + deltaSeconds));
  };

  const commitScrub = () => {
    if (scrubTime === null) return;
    if (isCurrent) seekTo(scrubTime);
    else playTrack(track, neighbors, scrubTime);
    setScrubTime(null);
  };

  return (
    <div className="aspect-video overflow-hidden bg-black">
      <div ref={registerPlayer} className="relative size-full overflow-hidden text-[var(--on-brand)]">
        <Image src={track.artworkUrl} alt="" fill sizes="(min-width: 1024px) 1100px, 100vw" className="object-cover opacity-60" />
        <div className="absolute inset-0 bg-linear-to-b from-[var(--scrim-from)] to-[var(--scrim-to)]" aria-hidden="true" />

        <div className="absolute inset-0 flex items-center justify-center" dir="ltr">
          <IconButton
            aria-label={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
            aria-busy={isBuffering}
            className="size-16 sm:size-20"
            onClick={togglePlay}
          >
            {isBuffering ? (
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            ) : isPlaying ? (
              <Pause size={28} fill="currentColor" aria-hidden="true" />
            ) : (
              <Play size={28} fill="currentColor" aria-hidden="true" />
            )}
          </IconButton>
        </div>

        <div className="absolute inset-x-0 bottom-0 grid gap-2 p-3 sm:p-5" dir="ltr">
          {hasError && (
            <p role="alert" className="text-center text-sm font-bold" dir="rtl">
              تعذّر تشغيل الصوت. اضغط تشغيل للمحاولة مرة أخرى.
            </p>
          )}
          <div className="flex items-center gap-2 sm:gap-3">
            <IconButton aria-label={`الرجوع ${DEFAULT_SEEK_OFFSET_SECONDS} ثوانٍ`} className="size-10" onClick={() => skip(-DEFAULT_SEEK_OFFSET_SECONDS)}>
              <RotateCcw size={18} aria-hidden="true" />
            </IconButton>
            <span className="w-12 shrink-0 text-xs font-bold tabular-nums sm:text-sm">{formatTimestamp(shownTime)}</span>
            <input
              type="range"
              aria-label="موضع التشغيل"
              aria-valuetext={`${formatTimestamp(shownTime)} من ${formatTimestamp(duration)}`}
              min={0}
              max={Math.max(1, Math.floor(duration))}
              step={1}
              value={Math.floor(shownTime)}
              onChange={(event) => setScrubTime(Number(event.target.value))}
              onPointerUp={commitScrub}
              onKeyUp={commitScrub}
              onBlur={commitScrub}
              className="h-6 min-w-0 flex-1 cursor-pointer accent-[var(--accent)]"
            />
            <span className="w-12 shrink-0 text-end text-xs font-bold tabular-nums sm:text-sm">{formatTimestamp(duration)}</span>
            <IconButton aria-label={`التقدّم ${DEFAULT_SEEK_OFFSET_SECONDS} ثوانٍ`} className="size-10" onClick={() => skip(DEFAULT_SEEK_OFFSET_SECONDS)}>
              <RotateCw size={18} aria-hidden="true" />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
}
