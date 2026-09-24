/**
 * A SoundCloud *track page* URL (https://soundcloud.com/artist/track, pasted
 * into an episode's audioUrl override -- see episode-editor.tsx's hint text)
 * is an HTML page, not a media file: `<audio src>` requests it and gets HTML
 * back, which is exactly the "تعذّر تشغيل الصوت" failure this module exists to
 * fix. SoundCloud's API has no public, unauthenticated way to resolve a track
 * to a direct MP3 stream -- the sanctioned way to play one outside
 * soundcloud.com itself is their own oEmbed-style `<iframe>` widget
 * (w.soundcloud.com/player), which needs no API key/client id. This module
 * only recognizes that shape and builds its embed src; it never touches the
 * `<audio>`-based engine (lib/playback/engine.ts) -- see
 * components/media/soundcloud-audio-surface.tsx for why.
 *
 * Not for the Waie podcast feed's own enclosure URLs (lib/audio/podcast-feed.ts):
 * those resolve to feeds.soundcloud.com/stream/*.mp3, a real direct file the
 * existing <audio> element already plays fine -- excluded below by hostname.
 */

const SOUNDCLOUD_TRACK_HOST = /(^|\.)soundcloud\.com$/i;
/** feeds.soundcloud.com (RSS enclosures) and api-v2/api.soundcloud.com are not track pages. */
const SOUNDCLOUD_NON_TRACK_SUBDOMAINS = new Set(["feeds.soundcloud.com", "api.soundcloud.com", "api-v2.soundcloud.com"]);

function parseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

/** True for a soundcloud.com track/set/user page URL -- never for our own resolved audio file URLs. */
export function isSoundCloudTrackUrl(url: string): boolean {
  const parsed = parseUrl(url);
  if (!parsed) return false;
  const host = parsed.hostname.toLowerCase();
  if (host === "w.soundcloud.com") return false; // already an embed URL, handled separately below
  return SOUNDCLOUD_TRACK_HOST.test(host) && !SOUNDCLOUD_NON_TRACK_SUBDOMAINS.has(host);
}

/** True for an already-built SoundCloud widget embed URL (w.soundcloud.com/player/...). */
function isSoundCloudEmbedUrl(url: string): boolean {
  const parsed = parseUrl(url);
  return parsed?.hostname.toLowerCase() === "w.soundcloud.com";
}

/**
 * The `<iframe>` src to actually play `url`, or null when `url` isn't a
 * SoundCloud URL at all (the caller should treat it as a direct audio file).
 * Handles both a plain track page URL (the realistic admin-pasted case) and
 * an already-built embed URL (passed through as-is).
 */
export function getSoundCloudEmbedSrc(url: string): string | null {
  if (isSoundCloudEmbedUrl(url)) return url;
  if (!isSoundCloudTrackUrl(url)) return null;

  const params = new URLSearchParams({
    url,
    auto_play: "false",
    visual: "true",
    show_user: "true",
    show_reposts: "false",
    show_comments: "false",
  });
  return `https://w.soundcloud.com/player/?${params.toString()}`;
}
