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
  durationSeconds: number;
};

export type PlaybackNeighbors = {
  previous: MediaItem | null;
  next: MediaItem | null;
};

export const NO_NEIGHBORS: PlaybackNeighbors = { previous: null, next: null };

/** `audioUrl` is what the episode resolved to (see lib/audio/podcast-feed.ts); omit it to use only an explicit `Episode.audioUrl`. */
export function toMediaItem(episode: Episode, subtitle: string, audioUrl?: string | null): MediaItem {
  return {
    episodeId: episode.id,
    slug: episode.slug,
    title: episode.title,
    subtitle,
    thumbnailUrl: episode.thumbnailUrl,
    youtubeVideoId: episode.youtubeVideoId,
    audioUrl: (audioUrl === undefined ? episode.audioUrl : audioUrl) || null,
    durationSeconds: episode.durationSeconds,
  };
}

/** Don't bother resuming for a few seconds of accidental progress, and don't resume an episode that's effectively already over. */
const RESUME_MIN_SECONDS = 5;
const RESUME_MAX_FRACTION = 0.98;

/** Where to pick a stored episode back up, or null to start from the beginning (nothing meaningful watched yet, already finished, or effectively at the end). */
export function getResumePosition(entry: ProgressEntry | undefined, durationSeconds: number): number | null {
  if (
    entry &&
    !entry.completed &&
    entry.seconds > RESUME_MIN_SECONDS &&
    entry.seconds < durationSeconds * RESUME_MAX_FRACTION
  ) {
    return entry.seconds;
  }
  return null;
}
