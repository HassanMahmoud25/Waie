import { getStoredProgress, recordProgress } from "@/hooks/use-library";
import { NO_NEIGHBORS, convertPosition, durationIn, getResumePosition } from "./item";
import type { MediaItem, MediaMode, PlaybackNeighbors } from "./item";
import {
  bindMediaSessionActions,
  setMediaSessionMetadata,
  setMediaSessionPlaybackState,
  setMediaSessionPosition,
  setSkipActions,
} from "./media-session";
import { readStoredMedia, writeStoredMedia } from "./persistence";
import { YT_STATE, loadYouTubeIframeApi } from "./youtube-api";
import type { YTPlayer } from "./youtube-api";

/**
 * Waie's one media engine: everything that plays -- an episode's video (the
 * YouTube embed) or its audio (an HTML5 <audio> file) -- goes through here.
 *
 * It is a module singleton on purpose, not React state. React trees come and go
 * with every route change; a media element that unmounts stops playing. So the
 * only things React owns are *views* of this store (useSyncExternalStore) and
 * the one persistent iframe host mounted in the root layout (see
 * components/media/video-host.tsx). Two invariants follow:
 *
 *  - There is exactly one playback source at any moment. Starting audio tears
 *    the video iframe down; the video claiming playback unloads the audio.
 *  - Playback survives navigation: the <audio> element is created detached
 *    (never in the DOM, so nothing can unmount it), and the iframe lives in the
 *    root layout, moving between "over the episode page's video slot" and "mini
 *    player" without ever being re-parented or reloaded.
 *
 * currentTime is deliberately NOT part of the snapshot: it changes every
 * second, and only progress readouts care. It lives in its own tiny store
 * (subscribeTime) so a tick re-renders a slider, not the app.
 */

/** How often to persist progress while playing (same cadence the YouTube-only player always used). */
const PROGRESS_SAVE_INTERVAL_MS = 5000;
/** How often to read the iframe's clock -- the IFrame API has no timeupdate event. */
const VIDEO_POLL_MS = 500;
/** "Previous" restarts the current episode when you're more than this far in, like every media player. */
const RESTART_INSTEAD_OF_PREVIOUS_SECONDS = 5;

/** A request for the video iframe to hold a given video. The host reloads it only when `loadId` changes. */
export type VideoRequest = {
  item: MediaItem;
  startAt: number;
  autoplay: boolean;
  loadId: number;
};

export type PlaybackSnapshot = {
  /** What the player is holding -- playing, paused, or restored from the last visit and not yet started. */
  item: MediaItem | null;
  /** The held item's mode; when nothing is held, the mode episode pages open in. */
  mode: MediaMode;
  preferredMode: MediaMode;
  /** false for an item restored after a refresh: shown, but no audio/video has been fetched or started yet. */
  isLoaded: boolean;
  isPlaying: boolean;
  isBuffering: boolean;
  hasError: boolean;
  duration: number;
  volume: number;
  /** The episode whose large player is on screen right now (video slot or audio surface), if any. */
  slotEpisodeId: string | null;
  /** Bumps when the slot's element changes, so the iframe host re-measures it. */
  slotVersion: number;
  videoRequest: VideoRequest | null;
  hasPrevious: boolean;
  hasNext: boolean;
};

const IDLE_SNAPSHOT: PlaybackSnapshot = {
  item: null,
  mode: "video",
  preferredMode: "video",
  isLoaded: false,
  isPlaying: false,
  isBuffering: false,
  hasError: false,
  duration: 0,
  volume: 1,
  slotEpisodeId: null,
  slotVersion: 0,
  videoRequest: null,
  hasPrevious: false,
  hasNext: false,
};

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let item: MediaItem | null = null;
let mode: MediaMode = "video";
let preferredMode: MediaMode = "video";
let isLoaded = false;
let isPlaying = false;
let isBuffering = false;
let hasError = false;
let volume = 1;
let neighbors: PlaybackNeighbors = NO_NEIGHBORS;
/** The position to report while nothing is loaded (restored session) or a fresh source hasn't reported its own yet. */
let basePosition = 0;
let lastSavedAt = 0;

let audio: HTMLAudioElement | null = null;
/** A position to jump to once the new audio source knows its length -- iOS Safari ignores currentTime writes before metadata is loaded. */
let pendingStartAt: number | null = null;

let yt: YTPlayer | null = null;
let ytReady = false;
let ytAppliedLoadId = -1;
let videoPoll: ReturnType<typeof setInterval> | null = null;
let videoRequest: VideoRequest | null = null;
let loadCounter = 0;

let slotItem: MediaItem | null = null;
let slotElement: HTMLElement | null = null;
let slotKind: "video" | "audio" = "video";
let slotNeighbors: PlaybackNeighbors = NO_NEIGHBORS;
let slotVersion = 0;
let slotToken = 0;

let skipHandler: ((from: MediaItem, to: MediaItem) => void) | null = null;
let sessionBound = false;
let initialized = false;

let snapshot: PlaybackSnapshot = IDLE_SNAPSHOT;
let timeValue = 0;
const listeners = new Set<() => void>();
const timeListeners = new Set<() => void>();

// ---------------------------------------------------------------------------
// External-store plumbing (see hooks/use-playback.ts)
// ---------------------------------------------------------------------------

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): PlaybackSnapshot {
  init();
  return snapshot;
}

export function getServerSnapshot(): PlaybackSnapshot {
  return IDLE_SNAPSHOT;
}

export function subscribeTime(listener: () => void): () => void {
  timeListeners.add(listener);
  return () => {
    timeListeners.delete(listener);
  };
}

export function getTimeSnapshot(): number {
  init();
  return timeValue;
}

export function getServerTimeSnapshot(): number {
  return 0;
}

function currentDuration(): number {
  if (audioActive() && audio && Number.isFinite(audio.duration) && audio.duration > 0) return audio.duration;
  return item?.durationSeconds ?? 0;
}

function buildSnapshot(): PlaybackSnapshot {
  return {
    item,
    mode: item ? mode : preferredMode,
    preferredMode,
    isLoaded,
    isPlaying,
    isBuffering,
    hasError,
    duration: currentDuration(),
    volume,
    slotEpisodeId: slotItem?.episodeId ?? null,
    slotVersion,
    videoRequest,
    hasPrevious: neighbors.previous !== null,
    hasNext: neighbors.next !== null,
  };
}

function publish() {
  const next = buildSnapshot();
  const changed = (Object.keys(next) as (keyof PlaybackSnapshot)[]).some((key) => next[key] !== snapshot[key]);
  if (!changed) return;
  snapshot = next;
  listeners.forEach((listener) => listener());
}

/** Whole-second granularity: a 4Hz timeupdate must not become 4 renders a second. */
function publishTime() {
  const next = Math.floor(getPlaybackTime());
  if (next === timeValue) return;
  timeValue = next;
  timeListeners.forEach((listener) => listener());
}

function init() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  const stored = readStoredMedia();
  preferredMode = stored.preferredMode;
  volume = stored.volume;
  if (stored.session) {
    // Restored, not resumed: the item shows up in the player at its old position, but nothing is
    // fetched or started until the visitor presses play (a page load can't start media anyway --
    // autoplay policies require a gesture -- so we don't pretend otherwise).
    item = stored.session.item;
    mode = stored.session.mode === "audio" && item.audioUrl ? "audio" : "video";
    basePosition = stored.session.position;
    timeValue = Math.floor(basePosition);
  }
  snapshot = buildSnapshot();

  // Never pause on visibility changes -- continuing in the background is the point. Hiding is just
  // the last moment we're guaranteed to run before the OS might freeze or kill the page, so
  // persist then; coming back, re-read the element (timers and events can be throttled while
  // hidden, and the OS may have paused us for a call or an unplugged headset).
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      saveProgress();
    } else {
      if (audioActive()) refreshAudio();
      publishTime();
    }
  });
  window.addEventListener("pagehide", saveProgress);
  window.addEventListener("pageshow", () => {
    if (audioActive()) refreshAudio();
  });
}

// ---------------------------------------------------------------------------
// Derived state
// ---------------------------------------------------------------------------

function videoClaimed(): boolean {
  return item !== null && mode === "video" && isLoaded;
}

function audioActive(): boolean {
  return item !== null && mode === "audio" && isLoaded && audio !== null;
}

/** Where saved watch progress resumes `target` in `forMode`, on that mode's own timeline. */
function resumeFor(target: MediaItem, forMode: MediaMode): number {
  return getResumePosition(getStoredProgress(target.episodeId), durationIn(target, forMode)) ?? 0;
}

/** Where a not-yet-started iframe for `target` should begin: the held position if it's the held episode, else the saved watch progress. */
function startFor(target: MediaItem): number {
  return item?.episodeId === target.episodeId ? basePosition : resumeFor(target, "video");
}

/** The mode a fresh play of `target` should use: its own if it's the held episode, otherwise the visitor's preference (audio only where audio exists). */
export function modeFor(target: MediaItem): MediaMode {
  if (item?.episodeId === target.episodeId) return mode;
  return preferredMode === "audio" && target.audioUrl ? "audio" : "video";
}

function readVideoTime(): number {
  if (!yt || !ytReady) return basePosition;
  try {
    const state = yt.getPlayerState();
    // An unstarted/cued player reports 0 rather than the position it will start from.
    if (state === YT_STATE.UNSTARTED || state === YT_STATE.CUED) return basePosition;
    return yt.getCurrentTime();
  } catch {
    return basePosition;
  }
}

/** The position to show/report: what the held source really says, falling back to the last known position. */
export function getPlaybackTime(): number {
  if (!item) return 0;
  if (!isLoaded) return basePosition;
  if (mode === "audio") return pendingStartAt ?? audio?.currentTime ?? basePosition;
  return readVideoTime();
}

export function getSlotElement(): HTMLElement | null {
  return slotElement;
}

// ---------------------------------------------------------------------------
// Persistence + watch progress
// ---------------------------------------------------------------------------

function persist(position = getPlaybackTime()) {
  if (typeof window === "undefined") return;
  writeStoredMedia({ preferredMode, volume, session: item ? { item, mode, position } : null });
}

function saveProgress() {
  if (!item || !isLoaded) return;
  if (mode === "audio" && pendingStartAt !== null) return;
  const duration = currentDuration();
  const seconds = mode === "audio" && audio?.ended ? duration : getPlaybackTime();
  if (seconds > 0) recordProgress(item.episodeId, seconds, duration);
  lastSavedAt = Date.now();
  persist(seconds);
}

// ---------------------------------------------------------------------------
// Media Session (lock screen / notification / media keys)
// ---------------------------------------------------------------------------

function ensureMediaSession() {
  if (sessionBound) return;
  sessionBound = true;
  bindMediaSessionActions({
    play: resumeOrStart,
    pause: pausePlayback,
    stop: pausePlayback,
    seekBy,
    seekTo,
    previous: skipToPrevious,
    next: skipToNext,
  });
}

function syncMediaSession() {
  if (!item || !isLoaded) {
    setMediaSessionPlaybackState("none");
    return;
  }
  setMediaSessionPlaybackState(hasError ? "none" : isPlaying ? "playing" : "paused");
  setMediaSessionPosition(currentDuration(), getPlaybackTime(), mode === "audio" ? (audio?.playbackRate ?? 1) : 1);
}

function syncSkipActions() {
  setSkipActions(
    { previous: skipToPrevious, next: skipToNext },
    { previous: neighbors.previous !== null, next: neighbors.next !== null },
  );
}

// ---------------------------------------------------------------------------
// Audio driver
// ---------------------------------------------------------------------------

/** Re-reads the element into engine state and publishes. */
function refreshAudio() {
  isPlaying = audio !== null && !audio.paused && !audio.ended && !hasError;
  syncMediaSession();
  publishTime();
  publish();
}

function ensureAudio(): HTMLAudioElement {
  if (audio) return audio;

  // One element for the whole session (never a new Audio() per episode): iOS grants "playback
  // allowed" per element, so switching tracks from the lock screen keeps working after the
  // first user-initiated play.
  const element = new Audio();
  element.preload = "metadata";
  audio = element;

  // Ignore events from an element that's been unloaded for the other mode.
  const on = (type: keyof HTMLMediaElementEventMap, handler: () => void) =>
    element.addEventListener(type, () => {
      if (audioActive()) handler();
    });

  on("loadedmetadata", () => {
    if (pendingStartAt !== null) {
      const start = pendingStartAt;
      pendingStartAt = null;
      element.currentTime = Math.min(start, currentDuration());
    }
    refreshAudio();
  });
  on("durationchange", refreshAudio);
  on("play", refreshAudio);
  on("playing", () => {
    isBuffering = false;
    refreshAudio();
  });
  on("waiting", () => {
    isBuffering = true;
    refreshAudio();
  });
  on("canplay", () => {
    isBuffering = false;
    refreshAudio();
  });
  on("pause", () => {
    saveProgress();
    refreshAudio();
  });
  on("ended", () => {
    saveProgress();
    refreshAudio();
  });
  on("seeking", publishTime);
  on("seeked", () => {
    saveProgress();
    refreshAudio();
  });
  on("ratechange", syncMediaSession);
  on("timeupdate", () => {
    if (!element.paused && Date.now() - lastSavedAt >= PROGRESS_SAVE_INTERVAL_MS) saveProgress();
    publishTime();
  });
  on("error", () => {
    hasError = true;
    isBuffering = false;
    refreshAudio();
  });

  return element;
}

function loadAudio(target: MediaItem, startAt: number) {
  const element = ensureAudio();
  pendingStartAt = startAt > 0 ? startAt : null;
  lastSavedAt = Date.now();
  element.volume = volume;
  // Setting src is the first (and only) moment audio bytes are requested -- preload is "metadata".
  element.src = target.audioUrl!;
}

async function playAudio() {
  const element = audio;
  if (!element || !audioActive()) return;
  try {
    await element.play();
  } catch (error) {
    // AbortError: a newer load/pause superseded this play() -- nothing to report.
    if (error instanceof DOMException && error.name === "AbortError") return;
    // NotAllowedError (autoplay policy) leaves us paused; NotSupportedError means the source itself is unplayable.
    if (error instanceof DOMException && error.name === "NotSupportedError") hasError = true;
    isBuffering = false;
    refreshAudio();
  }
}

/** Unloads the audio source so a paused-in-the-other-mode episode isn't holding a connection or buffer. */
function stopAudio() {
  if (!audio) return;
  audio.pause();
  audio.removeAttribute("src");
  audio.load();
  pendingStartAt = null;
}

// ---------------------------------------------------------------------------
// Video driver (YouTube IFrame Player, hosted by components/media/video-host.tsx)
// ---------------------------------------------------------------------------

function pauseVideo() {
  try {
    yt?.pauseVideo();
  } catch {
    // Player not ready -- nothing playing to pause.
  }
}

function stopVideoPoll() {
  if (videoPoll !== null) {
    clearInterval(videoPoll);
    videoPoll = null;
  }
}

function startVideoPoll() {
  stopVideoPoll();
  videoPoll = setInterval(() => {
    if (Date.now() - lastSavedAt >= PROGRESS_SAVE_INTERVAL_MS) saveProgress();
    publishTime();
  }, VIDEO_POLL_MS);
}

/** Tells the live iframe to switch to the current request, if it isn't already showing it. */
function applyVideoRequest() {
  const request = videoRequest;
  if (!request || !yt || !ytReady || ytAppliedLoadId === request.loadId) return;
  ytAppliedLoadId = request.loadId;
  const options = { videoId: request.item.youtubeVideoId, startSeconds: request.startAt > 0 ? request.startAt : undefined };
  try {
    if (request.autoplay) yt.loadVideoById(options);
    else yt.cueVideoById(options);
  } catch {
    // The iframe is still initialising; onReady applies the request.
  }
}

/**
 * Keeps the iframe request consistent with what's on screen. While no video is
 * playing, the request is simply "show the episode whose video slot is on the
 * page" (YouTube's own poster, exactly as before) -- or nothing, so the iframe
 * isn't kept alive for a page that no longer shows it. A playing/paused video
 * keeps its request through navigation; that's what makes it the mini player.
 */
function settleVideoRequest() {
  if (videoClaimed()) return;
  if (slotItem && slotKind === "video") {
    if (videoRequest?.item.episodeId !== slotItem.episodeId) {
      videoRequest = { item: slotItem, startAt: startFor(slotItem), autoplay: false, loadId: ++loadCounter };
      applyVideoRequest();
    }
  } else {
    videoRequest = null;
  }
}

/** The visitor pressed play inside the iframe on an episode page: that video now owns playback. */
function claimVideo(target: MediaItem) {
  saveProgress(); // the outgoing episode's position, while it's still readable
  stopAudio();
  const same = item?.episodeId === target.episodeId;
  item = target;
  mode = "video";
  preferredMode = "video";
  isLoaded = true;
  hasError = false;
  neighbors = same ? neighbors : slotItem?.episodeId === target.episodeId ? slotNeighbors : NO_NEIGHBORS;
  ensureMediaSession();
  setMediaSessionMetadata(target);
  syncSkipActions();
  lastSavedAt = Date.now();
}

function onVideoState(code: number) {
  const request = videoRequest;
  if (!request) return;
  const holding = videoClaimed() && item?.episodeId === request.item.episodeId;

  if (code === YT_STATE.PLAYING) {
    if (!holding) claimVideo(request.item);
    isPlaying = true;
    isBuffering = false;
    startVideoPoll();
  } else if (!holding) {
    return; // the slot's not-yet-started iframe buffering/cueing -- not playback state
  } else if (code === YT_STATE.BUFFERING) {
    isBuffering = true;
  } else {
    isPlaying = false;
    isBuffering = false;
    stopVideoPoll();
    basePosition = getPlaybackTime();
    saveProgress();
  }
  syncMediaSession();
  publishTime();
  publish();
}

/**
 * Called by the iframe host when its <iframe> mounts. `srcLoadId` is the
 * request the iframe's src was built from, so only later requests need an
 * API-driven load. Returns the detach function for the effect cleanup.
 */
export function attachYouTube(iframe: HTMLIFrameElement, srcLoadId: number): () => void {
  let cancelled = false;
  let player: YTPlayer | null = null;
  ytAppliedLoadId = srcLoadId;
  ytReady = false;

  loadYouTubeIframeApi().then((YT) => {
    if (cancelled) return;
    player = new YT.Player(iframe, {
      events: {
        onReady: () => {
          if (cancelled) return;
          yt = player;
          ytReady = true;
          applyVideoRequest();
          publishTime();
        },
        onStateChange: (event) => {
          if (!cancelled) onVideoState(event.data);
        },
      },
    });
  });

  return () => {
    cancelled = true;
    stopVideoPoll();
    saveProgress();
    yt = null;
    ytReady = false;
    try {
      // React has already removed the iframe by now; this only releases the API's listeners.
      player?.destroy();
    } catch {
      // Player never finished initialising -- nothing to tear down.
    }
  };
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

/**
 * Loads `next` in `nextMode` from `startAt`, replacing whatever was held.
 * Callers are user gestures (buttons, timestamps, the OS media controls),
 * which is what lets `autoplay` succeed -- browsers refuse it otherwise.
 */
function start(next: MediaItem, nextMode: MediaMode, startAt: number, autoplay: boolean, nextNeighbors?: PlaybackNeighbors) {
  ensureMediaSession();
  saveProgress(); // the outgoing episode's position, while it's still on the element

  const same = item?.episodeId === next.episodeId;
  const useAudio = nextMode === "audio" && next.audioUrl !== null;

  item = next;
  mode = useAudio ? "audio" : "video";
  preferredMode = mode;
  isLoaded = true;
  isPlaying = false;
  isBuffering = useAudio && autoplay;
  hasError = false;
  basePosition = startAt;
  neighbors = nextNeighbors ?? (same ? neighbors : slotItem?.episodeId === next.episodeId ? slotNeighbors : NO_NEIGHBORS);
  stopVideoPoll();

  if (useAudio) {
    pauseVideo();
    videoRequest = null;
    settleVideoRequest();
    loadAudio(next, startAt);
    if (autoplay) void playAudio();
  } else {
    stopAudio();
    videoRequest = { item: next, startAt, autoplay, loadId: ++loadCounter };
    applyVideoRequest();
  }

  setMediaSessionMetadata(next);
  syncSkipActions();
  syncMediaSession();
  persist(startAt);
  publishTime();
  publish();
}

function resumeOrStart() {
  if (!item) return;
  if (!isLoaded) start(item, mode, basePosition, true);
  else resumePlayback();
}

export function resumePlayback() {
  if (!item || !isLoaded) return;
  if (mode === "audio") {
    void playAudio();
  } else if (yt && ytReady) {
    try {
      yt.playVideo();
    } catch {
      // Not playable yet; the visitor can use the iframe's own control.
    }
  } else if (videoRequest) {
    videoRequest = { ...videoRequest, autoplay: true, loadId: ++loadCounter };
    applyVideoRequest();
    publish();
  }
}

export function pausePlayback() {
  if (!item || !isLoaded) return;
  if (mode === "audio") audio?.pause();
  else pauseVideo();
}

export function togglePlayback() {
  if (!item) return;
  if (!isLoaded) resumeOrStart();
  else if (isPlaying) pausePlayback();
  else resumePlayback();
}

/**
 * Plays an episode. If it's already the held one in that mode this just
 * un-pauses it, so pages can call it blindly on every "play" press. Otherwise
 * it swaps the source: resuming from the stored watch-progress position unless
 * `startAt` says otherwise (a transcript/notes timestamp, which always wins).
 */
export function playItem(target: MediaItem, options: { mode?: MediaMode; startAt?: number; neighbors?: PlaybackNeighbors } = {}) {
  const wanted = options.mode ?? modeFor(target);
  const same = item?.episodeId === target.episodeId;

  if (same && isLoaded && mode === wanted) {
    if (options.neighbors) {
      neighbors = options.neighbors;
      syncSkipActions();
      publish();
    }
    if (options.startAt !== undefined) seekTo(options.startAt);
    resumePlayback();
    return;
  }

  const startAt = options.startAt ?? (same && item ? convertPosition(item, getPlaybackTime(), mode, wanted) : resumeFor(target, wanted));
  start(target, wanted, startAt, true, options.neighbors);
}

/** A transcript/notes/recommendation timestamp (on the video's timeline): play `target` from `seconds`, in whatever mode its page is showing. */
export function jumpTo(target: MediaItem, seconds: number) {
  playItem(target, { startAt: convertPosition(target, seconds, "video", modeFor(target)) });
}

export function seekTo(seconds: number, fastSeek = false) {
  if (!item) return;
  const target = Math.min(Math.max(0, seconds), currentDuration());
  basePosition = target;

  if (!isLoaded) {
    persist(target);
    publishTime();
    return;
  }

  if (mode === "audio") {
    const element = audio;
    if (!element) return;
    if (element.readyState >= HTMLMediaElement.HAVE_METADATA) {
      if (fastSeek && "fastSeek" in element) element.fastSeek(target);
      else element.currentTime = target;
    } else {
      pendingStartAt = target;
    }
  } else if (yt && ytReady) {
    try {
      yt.seekTo(target, true);
    } catch {
      // Ignored: the visitor can seek in the iframe itself.
    }
  } else if (videoRequest) {
    videoRequest = { ...videoRequest, startAt: target, loadId: ++loadCounter };
    applyVideoRequest();
  }

  syncMediaSession();
  publishTime();
  publish();
}

export function seekBy(deltaSeconds: number) {
  seekTo(getPlaybackTime() + deltaSeconds);
}

/**
 * Switches the held episode between its video and audio representations,
 * keeping the position and the playing/paused state. The two are the same
 * recording, so their timelines line up (proportionally so where the audio is
 * a differently cut edit -- see convertPosition).
 */
export function setMode(next: MediaMode) {
  if (next === "audio" && item && !item.audioUrl) return;
  preferredMode = next;

  if (!item || mode === next) {
    persist();
    publish();
    return;
  }
  if (!isLoaded) {
    basePosition = convertPosition(item, basePosition, mode, next);
    mode = next;
    persist();
    settleVideoRequest();
    publish();
    return;
  }
  start(item, next, convertPosition(item, getPlaybackTime(), mode, next), isPlaying || isBuffering);
}

/** For an episode page whose episode isn't the held one: remember the choice for when it's played, without touching what's playing. */
export function setPreferredMode(next: MediaMode) {
  if (preferredMode === next) return;
  preferredMode = next;
  persist();
  publish();
}

export function setVolume(next: number) {
  volume = Math.min(1, Math.max(0, next));
  if (audio) audio.volume = volume;
  persist();
  publish();
}

/** Closes the player: stops playback, unloads the source and forgets the session (mode preference and watch progress are kept). */
export function dismiss() {
  if (!item) return;
  saveProgress();
  stopVideoPoll();
  stopAudio();
  pauseVideo();
  item = null;
  isLoaded = false;
  isPlaying = false;
  isBuffering = false;
  hasError = false;
  basePosition = 0;
  neighbors = NO_NEIGHBORS;
  videoRequest = null;
  settleVideoRequest();
  setMediaSessionMetadata(null);
  setMediaSessionPlaybackState("none");
  persist();
  publishTime();
  publish();
}

// ---------------------------------------------------------------------------
// Previous / next
// ---------------------------------------------------------------------------

/** Lets the router-aware layer follow a skip with a page navigation (see components/media/global-player.tsx). */
export function setSkipHandler(handler: ((from: MediaItem, to: MediaItem) => void) | null) {
  skipHandler = handler;
}

function skipTo(target: MediaItem, nextNeighbors: PlaybackNeighbors) {
  const from = item;
  if (!from) return;
  const nextMode = mode === "audio" && target.audioUrl ? "audio" : "video";
  start(target, nextMode, resumeFor(target, nextMode), true, nextNeighbors);
  skipHandler?.(from, target);
}

export function skipToNext() {
  const target = neighbors.next;
  // The new page fills in the episode's own neighbours when it mounts; until then the only one we know is where we came from.
  if (target && item) skipTo(target, { previous: item, next: null });
}

export function skipToPrevious() {
  const target = neighbors.previous;
  if (getPlaybackTime() > RESTART_INSTEAD_OF_PREVIOUS_SECONDS || !target) {
    seekTo(0);
  } else if (item) {
    skipTo(target, { previous: null, next: item });
  }
}

// ---------------------------------------------------------------------------
// The episode page's large player (video slot or audio surface)
// ---------------------------------------------------------------------------

/**
 * An episode page announces that its large player is on screen. The engine
 * uses this for three things: hide the global mini player for that episode
 * (never two players for one thing), place the iframe over the page's video
 * slot instead of in the corner, and know the page's series neighbours.
 * Returns the unregister function for the effect cleanup.
 */
export function registerSlot(target: MediaItem, element: HTMLElement | null, kind: "video" | "audio", pageNeighbors: PlaybackNeighbors): () => void {
  const token = ++slotToken;
  slotItem = target;
  slotElement = element;
  slotKind = kind;
  slotNeighbors = pageNeighbors;
  slotVersion++;

  // Coming back to the page of the episode that's playing: make sure the lock screen's previous/next match this page's series.
  if (item?.episodeId === target.episodeId) {
    neighbors = pageNeighbors;
    syncSkipActions();
  }
  settleVideoRequest();
  publish();

  return () => {
    if (token !== slotToken) return; // a newer registration already replaced this one
    slotItem = null;
    slotElement = null;
    slotVersion++;
    // Deferred so a page that unmounts and immediately remounts (a route transition to the same
    // episode) doesn't tear the iframe down and rebuild it in between.
    queueMicrotask(() => {
      if (slotItem === null) settleVideoRequest();
      publish();
    });
  };
}
