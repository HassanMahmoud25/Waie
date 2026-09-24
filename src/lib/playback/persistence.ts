import type { MediaItem, MediaMode } from "./item";

const STORAGE_KEY = "waie:media:v1";

export type StoredSession = {
  item: MediaItem;
  mode: MediaMode;
  position: number;
};

export type StoredMedia = {
  /** The mode an episode page opens in when nothing of it is loaded yet. */
  preferredMode: MediaMode;
  volume: number;
  /** What was loaded when the visitor last left. Restored paused -- never auto-played. */
  session: StoredSession | null;
};

const DEFAULTS: StoredMedia = { preferredMode: "video", volume: 1, session: null };

const isMode = (value: unknown): value is MediaMode => value === "video" || value === "audio";

function isItem(value: unknown): value is MediaItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.episodeId === "string" &&
    typeof item.slug === "string" &&
    typeof item.title === "string" &&
    typeof item.subtitle === "string" &&
    typeof item.thumbnailUrl === "string" &&
    typeof item.youtubeVideoId === "string" &&
    (item.audioUrl === null || typeof item.audioUrl === "string") &&
    // Optional in the sense that a session stored before this field existed
    // won't have it -- normalized to null just below, never trusted as-is.
    (item.soundcloudEmbedSrc === undefined || item.soundcloudEmbedSrc === null || typeof item.soundcloudEmbedSrc === "string") &&
    typeof item.durationSeconds === "number"
  );
}

/** A stored item predates soundcloudEmbedSrc (or has it malformed) -- always resolve to a real MediaItem shape. */
function normalizeItem(item: MediaItem): MediaItem {
  return { ...item, soundcloudEmbedSrc: item.soundcloudEmbedSrc ?? null };
}

/** Storage is user-editable and outlives deploys, so trust nothing in it: anything malformed falls back to "no session". */
export function readStoredMedia(): StoredMedia {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const session = parsed.session as Record<string, unknown> | null | undefined;

    return {
      preferredMode: isMode(parsed.preferredMode) ? parsed.preferredMode : DEFAULTS.preferredMode,
      volume: typeof parsed.volume === "number" && parsed.volume >= 0 && parsed.volume <= 1 ? parsed.volume : DEFAULTS.volume,
      session:
        session && isItem(session.item) && isMode(session.mode) && typeof session.position === "number"
          ? { item: normalizeItem(session.item), mode: session.mode, position: Math.max(0, session.position) }
          : null,
    };
  } catch {
    return DEFAULTS;
  }
}

export function writeStoredMedia(media: StoredMedia): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(media));
  } catch {
    // Private browsing, storage full, etc. -- playback still works for this session.
  }
}
