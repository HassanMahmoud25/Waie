import type { Episode } from "@/types/episode";
import type { ProgressEntry } from "@/hooks/use-library";

/** Don't bother resuming for a few seconds of accidental progress, and don't resume an episode that's effectively already over. */
const RESUME_MIN_SECONDS = 5;
const RESUME_MAX_FRACTION = 0.98;

/**
 * The serializable slice of an episode the audio engine needs -- enough to
 * (re)load the audio and describe it to the OS, so playback keeps working
 * after the page that started it has been navigated away from.
 */
export type PlaybackTrack = {
  episodeId: string;
  slug: string;
  title: string;
  audioUrl: string;
  artworkUrl: string;
  durationSeconds: number;
};

export type PlaybackNeighbors = {
  previous: PlaybackTrack | null;
  next: PlaybackTrack | null;
};

/** null when the episode has no owner-supplied audio, i.e. it can only be played through the YouTube embed. */
export function toPlaybackTrack(episode: Episode): PlaybackTrack | null {
  if (!episode.audioUrl) return null;
  return {
    episodeId: episode.id,
    slug: episode.slug,
    title: episode.title,
    audioUrl: episode.audioUrl,
    artworkUrl: episode.thumbnailUrl,
    durationSeconds: episode.durationSeconds,
  };
}

/** Where to pick a stored episode back up, or null to start from the beginning (nothing meaningful watched yet, already finished, or effectively at the end). Shared by both player engines. */
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
