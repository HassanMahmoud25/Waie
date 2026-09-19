"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clapperboard, Headphones, Loader2, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX, X } from "lucide-react";
import { usePlayback, usePlaybackTime } from "@/hooks/use-playback";
import { dismiss, seekTo, setMode, setVolume, skipToNext, skipToPrevious, togglePlayback } from "@/lib/playback/engine";
import type { PlaybackSnapshot } from "@/lib/playback/engine";
import type { MediaItem } from "@/lib/playback/item";
import { TimeSlider } from "./time-slider";

type Playing = PlaybackSnapshot & { item: MediaItem };

/** "فيديو" / "صوت" -- the always-visible indicator of which representation is playing. */
function ModeChip({ mode }: { mode: "video" | "audio" }) {
  const Icon = mode === "audio" ? Headphones : Clapperboard;
  return (
    <span className="media-chip">
      <Icon size={12} aria-hidden="true" />
      {mode === "audio" ? "صوت" : "فيديو"}
    </span>
  );
}

function PlayPauseButton({ state, large = false }: { state: Playing; large?: boolean }) {
  const busy = state.isPlaying && state.isBuffering;
  const size = large ? 24 : 20;
  return (
    <button
      type="button"
      className="media-btn media-btn--primary"
      aria-label={state.isPlaying ? "إيقاف مؤقت" : "تشغيل"}
      aria-busy={busy}
      onClick={togglePlayback}
    >
      {busy ? (
        <Loader2 size={size} className="animate-spin" aria-hidden="true" />
      ) : state.isPlaying ? (
        <Pause size={size} fill="currentColor" aria-hidden="true" />
      ) : (
        <Play size={size} fill="currentColor" aria-hidden="true" />
      )}
    </button>
  );
}

function CloseButton() {
  return (
    <button type="button" className="media-btn" aria-label="إغلاق المشغّل" onClick={dismiss}>
      <X size={20} aria-hidden="true" />
    </button>
  );
}

/** Switches the held episode to its other representation in place, at the same position. Hidden when there's nothing to switch to. */
function ModeToggleButton({ state, className }: { state: Playing; className?: string }) {
  const toAudio = state.mode === "video";
  if (toAudio && !state.item.audioUrl) return null;
  const Icon = toAudio ? Headphones : Clapperboard;
  return (
    <button
      type="button"
      className={`media-btn ${className ?? ""}`}
      aria-label={toAudio ? "التحويل إلى الاستماع فقط" : "التحويل إلى المشاهدة"}
      title={toAudio ? "استماع فقط" : "مشاهدة"}
      onClick={() => setMode(toAudio ? "audio" : "video")}
    >
      <Icon size={19} aria-hidden="true" />
    </button>
  );
}

/** A hairline of progress along the top edge. Its own component so the once-a-second tick re-renders only this. */
function ProgressLine() {
  const time = usePlaybackTime();
  const { duration } = usePlayback();
  const percent = duration > 0 ? Math.min(100, (time / duration) * 100) : 0;
  return (
    <div className="media-progress" role="presentation" dir="ltr">
      <span style={{ width: `${percent}%` }} />
    </div>
  );
}

function BarSlider({ fallbackDuration }: { fallbackDuration: number }) {
  const time = usePlaybackTime();
  const { duration } = usePlayback();
  return <TimeSlider value={time} max={duration || fallbackDuration} onCommit={seekTo} label="موضع التشغيل" />;
}

function VolumeControl({ volume }: { volume: number }) {
  return (
    <div className="hidden items-center gap-1 xl:flex" dir="ltr">
      <button
        type="button"
        className="media-btn"
        aria-label={volume === 0 ? "إلغاء كتم الصوت" : "كتم الصوت"}
        onClick={() => setVolume(volume === 0 ? 1 : 0)}
      >
        {volume === 0 ? <VolumeX size={19} aria-hidden="true" /> : <Volume2 size={19} aria-hidden="true" />}
      </button>
      <input
        type="range"
        className="media-range w-20"
        aria-label="مستوى الصوت"
        min={0}
        max={100}
        value={Math.round(volume * 100)}
        style={{ "--fill": `${volume * 100}%` } as CSSProperties}
        onChange={(event) => setVolume(Number(event.target.value) / 100)}
      />
    </div>
  );
}

/**
 * Compact "now playing" dock for audio (and for a video that has been
 * restored but not resumed): thumbnail, title, mode, the essential controls,
 * and a hairline of progress. Tapping the thumbnail/title opens the episode.
 * Sits above the mobile tab bar and never covers it, so navigation stays
 * one tap away.
 */
export function NowPlayingBar({ state }: { state: Playing }) {
  const { item } = state;
  return (
    <section className="media-dock" aria-label="المشغّل الحالي">
      <ProgressLine />
      <Link href={`/episodes/${item.slug}`} className="media-dock__open" aria-label={`فتح الحلقة: ${item.title}`}>
        <span className="media-dock__thumb">
          <Image src={item.thumbnailUrl} alt="" fill sizes="80px" className="object-cover" />
        </span>
        <span className="min-w-0">
          <span className="media-dock__title">{item.title}</span>
          <span className="media-dock__meta">
            <ModeChip mode={state.mode} />
            {state.hasError ? (
              <span role="status" className="truncate text-[var(--on-brand-accent)]">تعذّر تشغيل الصوت</span>
            ) : (
              item.subtitle && <span className="truncate">{item.subtitle}</span>
            )}
          </span>
        </span>
      </Link>

      <div className="hidden min-w-0 flex-1 md:block">
        <BarSlider fallbackDuration={item.durationSeconds} />
      </div>

      <div className="media-dock__controls" dir="ltr">
        {state.hasPrevious && (
          <button type="button" className="media-btn hidden sm:grid" aria-label="الحلقة السابقة" onClick={skipToPrevious}>
            <SkipBack size={19} fill="currentColor" aria-hidden="true" />
          </button>
        )}
        <PlayPauseButton state={state} />
        {state.hasNext && (
          <button type="button" className="media-btn hidden sm:grid" aria-label="الحلقة التالية" onClick={skipToNext}>
            <SkipForward size={19} fill="currentColor" aria-hidden="true" />
          </button>
        )}
        {state.mode === "audio" && <VolumeControl volume={state.volume} />}
        <ModeToggleButton state={state} className="hidden sm:grid" />
        <CloseButton />
      </div>
    </section>
  );
}

/** The strip under the mini video card: the video itself is the visual, so this is just title, mode and controls. */
export function MiniVideoStrip({ state }: { state: Playing }) {
  const { item } = state;
  return (
    <div className="media-strip">
      <ProgressLine />
      <Link href={`/episodes/${item.slug}`} className="media-dock__open" aria-label={`فتح الحلقة: ${item.title}`}>
        <span className="min-w-0">
          <span className="media-dock__title">{item.title}</span>
          <span className="media-dock__meta">
            <ModeChip mode="video" />
            {item.subtitle && <span className="truncate">{item.subtitle}</span>}
          </span>
        </span>
      </Link>
      <div className="media-dock__controls" dir="ltr">
        <ModeToggleButton state={state} />
        <PlayPauseButton state={state} />
        <CloseButton />
      </div>
    </div>
  );
}
