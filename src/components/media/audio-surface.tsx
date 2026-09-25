"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import {
  Headphones,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { useLibrary } from "@/hooks/use-library";
import { usePlayback, usePlaybackTime } from "@/hooks/use-playback";
import {
  pausePlayback,
  playItem,
  registerSlot,
  seekBy,
  seekTo,
  setMode,
  skipToNext,
  skipToPrevious,
} from "@/lib/playback/engine";
import { durationIn, getResumePosition } from "@/lib/playback/item";
import type { MediaItem, PlaybackNeighbors } from "@/lib/playback/item";
import { DEFAULT_SEEK_OFFSET_SECONDS } from "@/lib/playback/media-session";
import { formatDuration } from "@/lib/utils/format";
import { TimeSlider } from "./time-slider";

/**
 * The episode page's large player in Audio mode: the same 16:9 frame the video
 * occupies (so switching modes doesn't move the page), showing the episode's
 * own thumbnail as a still under a dark scrim -- it stays put while the audio
 * plays. Holds no playback state of its own; it mirrors the engine and sends it
 * commands, and the audio keeps going when this unmounts.
 */
export function AudioSurface({
  item,
  neighbors,
}: {
  item: MediaItem;
  neighbors: PlaybackNeighbors;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const playback = usePlayback();
  const { isHydrated, progress } = useLibrary();

  useEffect(
    () => registerSlot(item, frameRef.current, "audio", neighbors),
    [item, neighbors],
  );

  // The engine holds one episode at a time; every other episode's page just shows its saved position.
  const isCurrent = playback.item?.episodeId === item.episodeId;
  const isPlaying = isCurrent && playback.isLoaded && playback.isPlaying;
  const isBuffering = isPlaying && playback.isBuffering;
  const hasError = isCurrent && playback.hasError;
  const audioLength = durationIn(item, "audio");
  const savedPosition = isHydrated
    ? (getResumePosition(progress[item.episodeId], audioLength) ?? 0)
    : 0;

  const togglePlay = () => {
    if (isPlaying) pausePlayback();
    else playItem(item, { mode: "audio", neighbors });
  };

  console.log("item ====> ", item);

  return (
    <div
      ref={frameRef}
      className="relative aspect-video overflow-hidden bg-[var(--cinematic)] text-[var(--on-brand)]"
    >
      <Image
        src={item.thumbnailUrl}
        alt=""
        fill
        sizes="(min-width: 1024px) 1100px, 100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/45" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-linear-to-b from-black/35 via-transparent to-[var(--scrim-to)]"
        aria-hidden="true"
      />

      <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6">
        <span className="media-chip w-fit">
          <Headphones size={13} aria-hidden="true" />
          استمع إلى الحلقة
        </span>

        <div className="grid gap-2 sm:gap-3">
          <div className="hidden min-w-0 sm:block">
            <p className="line-clamp-2 text-lg font-black leading-snug md:text-xl">
              {item.title}
            </p>
            <p className="mt-1 text-sm font-bold text-[var(--on-brand-soft)]">
              {[item.subtitle, formatDuration(audioLength)]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>

          {hasError && (
            <p
              role="alert"
              className="flex flex-wrap items-center gap-x-3 text-sm font-bold"
            >
              تعذّر تشغيل الصوت.
              <button
                type="button"
                className="underline underline-offset-4"
                onClick={() => setMode("video")}
              >
                شاهد الفيديو بدلًا من ذلك
              </button>
            </p>
          )}

          {isCurrent ? (
            <LiveSlider fallbackDuration={audioLength} />
          ) : (
            <TimeSlider
              value={savedPosition}
              max={audioLength}
              onCommit={(seconds) =>
                playItem(item, { mode: "audio", startAt: seconds, neighbors })
              }
            />
          )}

          <div
            className="flex items-center justify-center gap-1 sm:gap-3"
            dir="ltr"
          >
            {isCurrent && playback.hasPrevious && (
              <button
                type="button"
                className="media-btn"
                aria-label="الحلقة السابقة"
                onClick={skipToPrevious}
              >
                <SkipBack size={20} fill="currentColor" aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              className="media-btn"
              aria-label={`الرجوع ${DEFAULT_SEEK_OFFSET_SECONDS} ثوانٍ`}
              onClick={() =>
                isCurrent
                  ? seekBy(-DEFAULT_SEEK_OFFSET_SECONDS)
                  : playItem(item, {
                      mode: "audio",
                      startAt: Math.max(
                        0,
                        savedPosition - DEFAULT_SEEK_OFFSET_SECONDS,
                      ),
                      neighbors,
                    })
              }
            >
              <RotateCcw size={20} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="media-btn media-btn--primary media-btn--lg"
              aria-label={isPlaying ? "إيقاف مؤقت" : "تشغيل الصوت"}
              aria-busy={isBuffering}
              onClick={togglePlay}
            >
              {isBuffering ? (
                <Loader2
                  size={26}
                  className="animate-spin"
                  aria-hidden="true"
                />
              ) : isPlaying ? (
                <Pause size={26} fill="currentColor" aria-hidden="true" />
              ) : (
                <Play size={26} fill="currentColor" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              className="media-btn"
              aria-label={`التقدّم ${DEFAULT_SEEK_OFFSET_SECONDS} ثوانٍ`}
              onClick={() =>
                isCurrent
                  ? seekBy(DEFAULT_SEEK_OFFSET_SECONDS)
                  : playItem(item, {
                      mode: "audio",
                      startAt: savedPosition + DEFAULT_SEEK_OFFSET_SECONDS,
                      neighbors,
                    })
              }
            >
              <RotateCw size={20} aria-hidden="true" />
            </button>
            {isCurrent && playback.hasNext && (
              <button
                type="button"
                className="media-btn"
                aria-label="الحلقة التالية"
                onClick={skipToNext}
              >
                <SkipForward size={20} fill="currentColor" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Split out so only the seek bar re-renders as the clock ticks -- not the thumbnail, title or buttons. */
function LiveSlider({ fallbackDuration }: { fallbackDuration: number }) {
  const time = usePlaybackTime();
  const { duration } = usePlayback();
  return (
    <TimeSlider
      value={time}
      max={duration || fallbackDuration}
      onCommit={seekTo}
    />
  );
}
