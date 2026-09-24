"use client";

import { useEffect, useRef } from "react";
import { Headphones } from "lucide-react";
import { usePlayback } from "@/hooks/use-playback";
import { useLibrary, recordProgress } from "@/hooks/use-library";
import { dismiss, getPlaybackTime } from "@/lib/playback/engine";
import { convertPosition, durationIn, getResumePosition } from "@/lib/playback/item";
import type { MediaItem } from "@/lib/playback/item";
import { loadSoundCloudWidgetApi } from "@/lib/playback/soundcloud-api";
import type { SCWidget } from "@/lib/playback/soundcloud-api";

/** Mirrors PROGRESS_SAVE_INTERVAL_MS in lib/playback/engine.ts -- same save cadence, same episode-keyed store. */
const PROGRESS_SAVE_INTERVAL_MS = 5000;

/**
 * Listen-mode surface for an episode whose audio is a SoundCloud track (see
 * lib/audio/soundcloud.ts) rather than a file our own <audio> element can
 * play -- SoundCloud's own embed widget is the sanctioned way to play a
 * SoundCloud track outside soundcloud.com itself.
 *
 * Deliberately NOT wired into lib/playback/engine.ts as a playback *source*:
 * the engine owns exactly one <audio> element it can drive directly, and an
 * iframe it doesn't own isn't that. But "one episode, one logical position"
 * (the whole point of engine.ts's own setMode/convertPosition) still has to
 * hold across this boundary, so this component reads/writes the *same*
 * per-episode progress store the engine itself reads/writes
 * (hooks/use-library.ts's getStoredProgress/recordProgress, DB-backed when
 * signed in, localStorage otherwise) via SoundCloud's official Widget API
 * (lib/playback/soundcloud-api.ts) -- the one sanctioned, key-less mechanism
 * for reading/seeking a track's position outside soundcloud.com. On mount it
 * seeds the widget from either the engine's own live position (if this
 * episode is the one currently held, e.g. was just playing as video) or the
 * last saved progress; while playing it saves back on the same cadence the
 * engine uses, plus a best-effort flush on visibilitychange/pagehide/unmount
 * (mirroring engine.ts's own visibilitychange/pagehide handling).
 */
export function SoundCloudAudioSurface({ item, embedSrc }: { item: MediaItem; embedSrc: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playback = usePlayback();
  const { isHydrated, progress } = useLibrary();

  const isCurrent = playback.item?.episodeId === item.episodeId;
  const audioLength = durationIn(item, "audio");

  // Same resume logic AudioSurface/engine.ts#playItem already use: the live
  // position of whatever the engine is currently holding for this exact
  // episode wins (exact, not a stale checkpoint); otherwise the last saved
  // progress, converted onto the audio timeline.
  const startPosition = isCurrent
    ? convertPosition(item, getPlaybackTime(), playback.mode, "audio")
    : isHydrated
      ? (getResumePosition(progress[item.episodeId], audioLength) ?? 0)
      : 0;
  const startPositionRef = useRef(startPosition);
  startPositionRef.current = startPosition;

  // One playback source at a time (lib/playback/engine.ts's own invariant): if the engine is
  // actively holding/playing this episode (as video) when its SoundCloud surface mounts, release
  // it -- dismiss(), not just pausePlayback(). A merely-paused session stays "held" indefinitely
  // (engine.ts never expires it), so switching back to Watch later would just reveal that frozen
  // position instead of picking up wherever SoundCloud actually got to in the meantime. dismiss()
  // itself calls saveProgress() first, so the fresh live position lands in the same per-episode
  // progress store this component reads its own startPosition from below -- switching back to
  // Watch afterwards is then a plain cold resume (VideoSlot/engine.ts#resumeFor), reading that
  // same store, same as opening the episode fresh. One shared source of truth, not two that can
  // drift apart.
  useEffect(() => {
    if (isCurrent) dismiss();
    // Only on mount -- isCurrent flips once switching finishes and shouldn't re-fire this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    let widget: SCWidget | null = null;
    let lastSavedAt = 0;

    const save = (milliseconds: number) => recordProgress(item.episodeId, milliseconds / 1000, audioLength);
    // Best-effort: getPosition is a postMessage round trip to the iframe, so this can't guarantee
    // completion before an actual tab close/hard reload the way engine.ts's own synchronous
    // saveProgress() can -- it's still worth attempting (covers the common cases: switching tabs,
    // backgrounding, an in-app Link navigation, all of which fire visibilitychange/pagehide well
    // before the page is actually gone), on top of the periodic PLAY_PROGRESS save below that
    // covers the rest. Swallows the "iframe already detached" TypeError the same way the unmount
    // cleanup does.
    const flush = () => {
      try {
        widget?.getPosition(save);
      } catch {
        // Iframe already detached -- nothing more to save.
      }
    };

    loadSoundCloudWidgetApi().then((SC) => {
      if (cancelled || !iframeRef.current) return;
      widget = SC.Widget(iframeRef.current);

      widget.bind(SC.Widget.Events.READY, () => {
        if (cancelled || !widget) return;
        if (startPositionRef.current > 0) widget.seekTo(Math.round(startPositionRef.current * 1000));
      });
      widget.bind(SC.Widget.Events.PLAY_PROGRESS, ({ currentPosition }) => {
        if (cancelled) return;
        const now = Date.now();
        if (now - lastSavedAt < PROGRESS_SAVE_INTERVAL_MS) return;
        lastSavedAt = now;
        save(currentPosition);
      });
      widget.bind(SC.Widget.Events.PAUSE, flush);
      widget.bind(SC.Widget.Events.FINISH, () => save(audioLength * 1000));
    });

    const onVisibilityChange = () => {
      if (document.hidden) flush();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", flush);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", flush);
      // Same best-effort save, for switching away (Watch) or unmounting via an in-app navigation.
      flush();
    };
    // embedSrc identifies the track; item/audioLength are derived from the same episode.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [embedSrc]);

  return (
    <div className="relative aspect-video overflow-hidden bg-[var(--cinematic)]">
      <span className="media-chip absolute start-4 top-4 z-10 sm:start-6 sm:top-6">
        <Headphones size={13} aria-hidden="true" />
        استمع إلى الحلقة عبر SoundCloud
      </span>
      <iframe
        ref={iframeRef}
        key={embedSrc}
        title={item.title}
        src={embedSrc}
        className="absolute inset-0 size-full"
        style={{ border: 0 }}
        allow="autoplay"
        loading="lazy"
      />
    </div>
  );
}
