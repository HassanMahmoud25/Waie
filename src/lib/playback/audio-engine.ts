import { getStoredProgress, recordProgress } from "@/hooks/use-library";
import {
  bindMediaSessionActions,
  setMediaSessionMetadata,
  setMediaSessionPlaybackState,
  setMediaSessionPosition,
  setSkipActions,
} from "./media-session";
import { getResumePosition } from "./track";
import type { PlaybackNeighbors, PlaybackTrack } from "./track";

/**
 * The episode player's HTML5 audio engine, used for episodes that have an
 * owner-supplied `audioUrl` (the YouTube embed is a different engine behind
 * the same <MediaPlayer>).
 *
 * It is a module singleton on purpose, not React state: the one <audio>
 * element is created detached (never inserted into the DOM) and lives for the
 * whole client session. That is what lets playback survive route changes --
 * the episode page unmounting doesn't touch it, and a media element that is
 * removed from the document would be paused by the browser. It's also the one
 * element for the whole session (never a new Audio() per episode), because
 * iOS grants "playback allowed" per element, so switching tracks from the lock
 * screen keeps working after the first user-initiated play.
 *
 * Components only read it (useAudioPlayback) and send it commands.
 */

/** How often to persist watch progress while audio is actively playing (same cadence as the YouTube engine). */
const PROGRESS_SAVE_INTERVAL_MS = 5000;

/** "Previous" restarts the current episode when you're more than this far in, like every media player. */
const RESTART_INSTEAD_OF_PREVIOUS_SECONDS = 5;

export type AudioSnapshot = {
  track: PlaybackTrack | null;
  /** Playback is running or trying to (includes buffering); false when paused, ended or errored. */
  isPlaying: boolean;
  isBuffering: boolean;
  hasError: boolean;
  currentTime: number;
  duration: number;
};

const IDLE_SNAPSHOT: AudioSnapshot = {
  track: null,
  isPlaying: false,
  isBuffering: false,
  hasError: false,
  currentTime: 0,
  duration: 0,
};

let audio: HTMLAudioElement | null = null;
let track: PlaybackTrack | null = null;
let neighbors: PlaybackNeighbors = { previous: null, next: null };
let snapshot: AudioSnapshot = IDLE_SNAPSHOT;
let isBuffering = false;
let hasError = false;
/** A position to jump to once the new source knows its length -- iOS Safari ignores currentTime writes before metadata is loaded. */
let pendingStartAt: number | null = null;
let lastSavedAt = 0;
let skipHandler: ((from: PlaybackTrack, to: PlaybackTrack) => void) | null = null;

const listeners = new Set<() => void>();

// ---------------------------------------------------------------------------
// External-store plumbing (see useAudioPlayback)
// ---------------------------------------------------------------------------

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): AudioSnapshot {
  return snapshot;
}

export function getServerSnapshot(): AudioSnapshot {
  return IDLE_SNAPSHOT;
}

function currentDuration(): number {
  if (audio && Number.isFinite(audio.duration) && audio.duration > 0) return audio.duration;
  return track?.durationSeconds ?? 0;
}

/** The position to show/report: the pending start while a fresh source is still loading, otherwise the element's real time. */
export function getPlaybackTime(): number {
  return pendingStartAt ?? audio?.currentTime ?? 0;
}

function readSnapshot(): AudioSnapshot {
  if (!audio || !track) return IDLE_SNAPSHOT;
  return {
    track,
    isPlaying: !audio.paused && !audio.ended && !hasError,
    isBuffering,
    hasError,
    currentTime: getPlaybackTime(),
    duration: currentDuration(),
  };
}

/** Re-reads the element and notifies subscribers only if something they can see changed (time compared by whole second, so ~4Hz timeupdate events don't cause 4 renders a second). */
function publish() {
  const next = readSnapshot();
  const prev = snapshot;
  if (
    prev.track === next.track &&
    prev.isPlaying === next.isPlaying &&
    prev.isBuffering === next.isBuffering &&
    prev.hasError === next.hasError &&
    prev.duration === next.duration &&
    Math.floor(prev.currentTime) === Math.floor(next.currentTime)
  ) {
    return;
  }
  snapshot = next;
  listeners.forEach((listener) => listener());
}

// ---------------------------------------------------------------------------
// Watch progress
// ---------------------------------------------------------------------------

function saveProgress() {
  if (!audio || !track || pendingStartAt !== null) return;
  const duration = currentDuration();
  const seconds = audio.ended ? duration : audio.currentTime;
  if (seconds > 0) recordProgress(track.episodeId, seconds, duration);
  lastSavedAt = Date.now();
}

// ---------------------------------------------------------------------------
// Media Session (lock screen / notification / media keys)
// ---------------------------------------------------------------------------

function syncMediaSession() {
  if (!audio || !track) {
    setMediaSessionPlaybackState("none");
    return;
  }
  setMediaSessionPlaybackState(hasError ? "none" : audio.paused ? "paused" : "playing");
  setMediaSessionPosition(currentDuration(), getPlaybackTime(), audio.playbackRate);
}

function syncSkipActions() {
  setSkipActions(
    { previous: skipToPrevious, next: skipToNext },
    { previous: neighbors.previous !== null, next: neighbors.next !== null },
  );
}

// ---------------------------------------------------------------------------
// Element lifecycle
// ---------------------------------------------------------------------------

function ensureAudio(): HTMLAudioElement {
  if (audio) return audio;

  const element = new Audio();
  element.preload = "metadata";
  audio = element;

  const on = (type: keyof HTMLMediaElementEventMap, handler: () => void) => element.addEventListener(type, handler);

  on("loadedmetadata", () => {
    if (pendingStartAt !== null) {
      const start = pendingStartAt;
      pendingStartAt = null;
      element.currentTime = Math.min(start, currentDuration());
    }
    syncMediaSession();
    publish();
  });
  on("durationchange", () => {
    syncMediaSession();
    publish();
  });
  on("play", () => {
    syncMediaSession();
    publish();
  });
  on("playing", () => {
    isBuffering = false;
    syncMediaSession();
    publish();
  });
  on("waiting", () => {
    isBuffering = true;
    publish();
  });
  on("canplay", () => {
    isBuffering = false;
    publish();
  });
  on("pause", () => {
    saveProgress();
    syncMediaSession();
    publish();
  });
  on("ended", () => {
    saveProgress();
    syncMediaSession();
    publish();
  });
  on("seeking", publish);
  on("seeked", () => {
    saveProgress();
    syncMediaSession();
    publish();
  });
  on("ratechange", syncMediaSession);
  on("timeupdate", () => {
    if (!element.paused && Date.now() - lastSavedAt >= PROGRESS_SAVE_INTERVAL_MS) saveProgress();
    publish();
  });
  on("error", () => {
    hasError = true;
    isBuffering = false;
    syncMediaSession();
    publish();
  });

  bindMediaSessionActions({
    play: () => void resume(),
    pause: pausePlayback,
    stop: pausePlayback,
    seekBy,
    seekTo,
    previous: skipToPrevious,
    next: skipToNext,
  });

  // Never pause on visibility changes -- continuing in the background is the
  // point. Hiding is just the last moment we're guaranteed to run before the
  // OS might freeze or kill the page, so persist then; coming back, re-read
  // the element (timers and events can be throttled while hidden, and the OS
  // may have paused us for a call or an unplugged headset) so the UI shows
  // what's really happening rather than what we last heard about.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      saveProgress();
    } else {
      syncMediaSession();
      publish();
    }
  });
  window.addEventListener("pagehide", saveProgress);
  window.addEventListener("pageshow", () => {
    syncMediaSession();
    publish();
  });

  return element;
}

function loadTrack(next: PlaybackTrack, nextNeighbors: PlaybackNeighbors, startAt: number | null) {
  const element = ensureAudio();

  // The outgoing episode's progress must be saved while its position is still on the element.
  saveProgress();

  track = next;
  neighbors = nextNeighbors;
  hasError = false;
  isBuffering = true;
  pendingStartAt = startAt !== null && startAt > 0 ? startAt : null;
  lastSavedAt = Date.now();

  element.src = next.audioUrl;
  setMediaSessionMetadata(next);
  syncSkipActions();
  syncMediaSession();
  publish();
}

async function resume() {
  const element = audio;
  if (!element || !track) return;
  try {
    await element.play();
  } catch (error) {
    // AbortError: a newer load/pause superseded this play() -- nothing to report.
    if (error instanceof DOMException && error.name === "AbortError") return;
    // NotAllowedError (autoplay policy) leaves us paused; NotSupportedError means the source itself is unplayable.
    if (error instanceof DOMException && error.name === "NotSupportedError") hasError = true;
    isBuffering = false;
    syncMediaSession();
    publish();
  }
}

// ---------------------------------------------------------------------------
// Public commands
// ---------------------------------------------------------------------------

/**
 * Starts (or resumes) an episode. If it's already the loaded episode this just
 * un-pauses it, so the page can call it blindly on every "play" press. For a
 * different episode it swaps the source on the same element, resuming from
 * the stored watch-progress position unless `startAt` says otherwise (a
 * transcript/notes timestamp, which always wins).
 *
 * Must be called from a user gesture the first time -- browsers refuse to
 * start audio otherwise -- which every caller (buttons, timestamps, the OS
 * media controls) already is.
 */
export function playTrack(next: PlaybackTrack, nextNeighbors: PlaybackNeighbors, startAt?: number) {
  if (track?.episodeId === next.episodeId && !hasError) {
    neighbors = nextNeighbors;
    syncSkipActions();
    if (startAt !== undefined) seekTo(startAt);
    void resume();
    return;
  }

  const stored = getStoredProgress(next.episodeId);
  loadTrack(next, nextNeighbors, startAt ?? getResumePosition(stored, next.durationSeconds));
  void resume();
}

export function pausePlayback() {
  audio?.pause();
}

export function seekTo(seconds: number, fastSeek = false) {
  const element = audio;
  if (!element || !track) return;
  const target = Math.min(Math.max(0, seconds), currentDuration());

  if (element.readyState >= HTMLMediaElement.HAVE_METADATA) {
    if (fastSeek && "fastSeek" in element) {
      element.fastSeek(target);
    } else {
      element.currentTime = target;
    }
  } else {
    pendingStartAt = target;
  }
  syncMediaSession();
  publish();
}

export function seekBy(deltaSeconds: number) {
  seekTo(getPlaybackTime() + deltaSeconds);
}

/**
 * The episode page knows its series neighbours; the engine only knows the ones
 * it was last told about. Called whenever a page for the loaded episode
 * mounts so the lock screen's previous/next always match the series.
 */
export function syncNeighbors(episodeId: string, nextNeighbors: PlaybackNeighbors) {
  if (track?.episodeId !== episodeId) return;
  neighbors = nextNeighbors;
  syncSkipActions();
}

/** Lets the router-aware layer follow a lock-screen skip with a page navigation (see AudioPlaybackBridge). */
export function setSkipHandler(handler: ((from: PlaybackTrack, to: PlaybackTrack) => void) | null) {
  skipHandler = handler;
}

function skipTo(target: PlaybackTrack, nextNeighbors: PlaybackNeighbors) {
  const from = track;
  if (!from) return;
  loadTrack(target, nextNeighbors, getResumePosition(getStoredProgress(target.episodeId), target.durationSeconds));
  void resume();
  skipHandler?.(from, target);
}

function skipToNext() {
  const target = neighbors.next;
  // The new page fills in the episode's own neighbours when it mounts; until then the only one we know is where we came from.
  if (target && track) skipTo(target, { previous: track, next: null });
}

function skipToPrevious() {
  const target = neighbors.previous;
  if (getPlaybackTime() > RESTART_INSTEAD_OF_PREVIOUS_SECONDS || !target) {
    seekTo(0);
  } else if (track) {
    skipTo(target, { previous: null, next: track });
  }
}
