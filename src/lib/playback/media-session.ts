import { siteConfig } from "@/config/site";
import type { MediaItem } from "./item";

/** Default step for the native skip buttons when the OS doesn't specify one. */
export const DEFAULT_SEEK_OFFSET_SECONDS = 10;

export type MediaSessionActions = {
  play: () => void;
  pause: () => void;
  stop: () => void;
  seekBy: (deltaSeconds: number) => void;
  seekTo: (seconds: number, fastSeek: boolean) => void;
  previous: () => void;
  next: () => void;
};

function getSession(): MediaSession | null {
  return typeof navigator !== "undefined" && "mediaSession" in navigator ? navigator.mediaSession : null;
}

/** Not every browser implements every action (older Safari throws a TypeError for the ones it doesn't know), and none of them should take the player down. */
function setHandler(action: MediaSessionAction, handler: MediaSessionActionHandler | null) {
  try {
    getSession()?.setActionHandler(action, handler);
  } catch {
    // Unsupported action on this browser -- the controls it does support still work.
  }
}

/** Registers the always-on transport actions. previous/next are registered separately (see setSkipActions) because they only exist when there's an adjacent episode to go to. */
export function bindMediaSessionActions(actions: MediaSessionActions) {
  setHandler("play", () => actions.play());
  setHandler("pause", () => actions.pause());
  setHandler("stop", () => actions.stop());
  setHandler("seekbackward", (details) => actions.seekBy(-(details.seekOffset ?? DEFAULT_SEEK_OFFSET_SECONDS)));
  setHandler("seekforward", (details) => actions.seekBy(details.seekOffset ?? DEFAULT_SEEK_OFFSET_SECONDS));
  setHandler("seekto", (details) => {
    if (typeof details.seekTime === "number") actions.seekTo(details.seekTime, Boolean(details.fastSeek));
  });
}

/** A null handler removes the native previous/next button, which is exactly what should happen at either end of a series. */
export function setSkipActions(actions: Pick<MediaSessionActions, "previous" | "next">, has: { previous: boolean; next: boolean }) {
  setHandler("previoustrack", has.previous ? () => actions.previous() : null);
  setHandler("nexttrack", has.next ? () => actions.next() : null);
}

/** Title + show name + artwork shown on the lock screen / notification / media hub. */
export function setMediaSessionMetadata(item: MediaItem | null) {
  const session = getSession();
  if (!session) return;
  if (!item) {
    session.metadata = null;
    return;
  }
  try {
    session.metadata = new MediaMetadata({
      title: item.title,
      artist: siteConfig.name,
      album: item.subtitle || siteConfig.name,
      artwork: [{ src: item.thumbnailUrl, sizes: "1280x720", type: "image/jpeg" }],
    });
  } catch {
    // MediaMetadata rejects malformed artwork; the title/controls are still worth having.
  }
}

export function setMediaSessionPlaybackState(state: MediaSessionPlaybackState) {
  const session = getSession();
  if (session) session.playbackState = state;
}

/**
 * Feeds the lock-screen scrubber. setPositionState throws unless duration is
 * a positive finite number and position lies within it, and a bad value here
 * must not break playback -- so validate, and swallow.
 */
export function setMediaSessionPosition(duration: number, position: number, playbackRate: number) {
  const session = getSession();
  if (!session || !Number.isFinite(duration) || duration <= 0) return;
  try {
    session.setPositionState({
      duration,
      position: Math.min(Math.max(0, position), duration),
      playbackRate: playbackRate || 1,
    });
  } catch {
    // Unsupported, or the browser disagreed about the values -- skip this update.
  }
}
