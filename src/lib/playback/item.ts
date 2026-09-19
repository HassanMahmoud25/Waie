import type { Episode } from "@/types/episode";
import type { ProgressEntry } from "@/hooks/use-library";

export type MediaMode = "video" | "audio";

/**
 * The serializable slice of an episode the player needs to (re)load either
 * representation of it and describe it to the OS -- enough that playback
 * keeps working after the page that started it has been navigated away from,
 * and small enough to persist across a refresh.
 */
export type MediaItem = {
  episodeId: string;
  slug: string;
  title: string;
  /** Series name, shown under the title in the player and on the lock screen. */
  subtitle: string;
  thumbnailUrl: string;
  youtubeVideoId: string;
  /** Waie's own published audio of this episode (its podcast feed, or an editor-set URL); null when there isn't any -- never YouTube. See docs/audio-pipeline.md. */
  audioUrl: string | null;
  /**
   * Length of the audio, when it's a different cut of the episode than the video (the podcast edit of some
   * episodes is trimmed or extended). Omitted/equal to durationSeconds -> same recording, same timeline.
   */
  audioDurationSeconds?: number;
  durationSeconds: number;
};

/** An audio source for an episode: where it is and how long that recording is. */
export type AudioSource = { url: string; durationSeconds: number };

export type PlaybackNeighbors = {
  previous: MediaItem | null;
  next: MediaItem | null;
};

export const NO_NEIGHBORS: PlaybackNeighbors = { previous: null, next: null };

/** `audio` is what the episode resolved to (see lib/audio/podcast-feed.ts); omit it to use only an explicit `Episode.audioUrl`. */
export function toMediaItem(episode: Episode, subtitle: string, audio?: AudioSource | null): MediaItem {
  const audioUrl = audio === undefined ? episode.audioUrl : audio?.url;
  return {
    episodeId: episode.id,
    slug: episode.slug,
    title: episode.title,
    subtitle,
    thumbnailUrl: episode.thumbnailUrl,
    youtubeVideoId: episode.youtubeVideoId,
    audioUrl: audioUrl || null,
    ...(audioUrl && audio && audio.durationSeconds !== episode.durationSeconds ? { audioDurationSeconds: audio.durationSeconds } : {}),
    durationSeconds: episode.durationSeconds,
  };
}

/**
 * Two lengths this close are the same edit, so positions carry across unchanged. Beyond it the
 * audio is a differently cut recording of the same episode (see convertPosition).
 */
export const MAX_DURATION_DRIFT_SECONDS = 5;

/** `seconds` on a timeline of length `from`, expressed on one of length `to`: unchanged for the same edit, proportional otherwise. */
export function scalePosition(seconds: number, from: number, to: number): number {
  if (from <= 0 || to <= 0 || Math.abs(from - to) <= MAX_DURATION_DRIFT_SECONDS) return seconds;
  return Math.min(to, (seconds * to) / from);
}

/** Length of the recording behind a mode: the video's, or the audio's own cut. */
export function durationIn(item: MediaItem, mode: MediaMode): number {
  return mode === "audio" && item.audioDurationSeconds ? item.audioDurationSeconds : item.durationSeconds;
}

/**
 * A position moved between the video's timeline and the audio's. Transcripts, notes and saved
 * progress are all on the video's timeline; the audio is the same recording except that some
 * podcast cuts are trimmed or extended, where a proportional position is the best available guess.
 */
export function convertPosition(item: MediaItem, seconds: number, from: MediaMode, to: MediaMode): number {
  return from === to ? seconds : scalePosition(seconds, durationIn(item, from), durationIn(item, to));
}

/** Don't bother resuming for a few seconds of accidental progress, and don't resume an episode that's effectively already over. */
const RESUME_MIN_SECONDS = 5;
const RESUME_MAX_FRACTION = 0.98;

/** Where to pick a stored episode back up, or null to start from the beginning (nothing meaningful watched yet, already finished, or effectively at the end). */
export function getResumePosition(entry: ProgressEntry | undefined, durationSeconds: number): number | null {
  if (!entry || entry.completed) return null;
  // Progress was recorded against whichever recording played; put it on the timeline being resumed.
  const seconds = scalePosition(entry.seconds, entry.durationSeconds, durationSeconds);
  return seconds > RESUME_MIN_SECONDS && seconds < durationSeconds * RESUME_MAX_FRACTION ? seconds : null;
}
