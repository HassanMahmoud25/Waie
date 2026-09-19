import { siteConfig } from "@/config/site";
import type { AudioSource } from "@/lib/playback/item";
import type { Episode } from "@/types/episode";

/**
 * Where an episode's audio comes from: Waie's own podcast feed.
 *
 * Every episode that goes out as a YouTube video is also published as a podcast
 * episode -- the same recording, as a plain MP3 -- to Apple Podcasts / Spotify /
 * SoundCloud, all fed by one public RSS feed. That is the audio "already inside
 * the video", published by its owner, so Listen mode needs no audio files
 * to be prepared and nothing extra in the content model: the feed is read on the
 * server, cached, and each episode is matched to its item.
 *
 * Audio is never taken from YouTube (its developer policies forbid it, and the
 * embed exposes no audio-only stream anyway -- see docs/audio-pipeline.md).
 *
 * Server-only: call from Server Components / server code, never a Client Component.
 */

const FETCH_TIMEOUT_MS = 4000;
const CACHE_SECONDS = 3600;
/** After a failed fetch, don't retry (and stall page renders on the timeout) for this long. */
const FAILURE_BACKOFF_MS = 60_000;

export type FeedItem = {
  title: string;
  /** The enclosure URL exactly as published. It redirects to a short-lived signed CDN URL, so never store the redirect target. */
  url: string;
  durationSeconds: number;
  /** "وعي 111" -> 111. null for the few unnumbered episodes. */
  number: number | null;
  titleKey: string;
};

// ---------------------------------------------------------------------------
// Parsing + matching (pure)
// ---------------------------------------------------------------------------

/** Arabic-Indic (٠-٩) and Extended Arabic-Indic (۰-۹) digits -> ASCII. Titles here mix scripts ("٧۳"). */
function toAsciiDigits(value: string): string {
  return value.replace(/[٠-٩۰-۹]/g, (digit) => String(digit.charCodeAt(0) - (digit.charCodeAt(0) >= 0x06f0 ? 0x06f0 : 0x0660)));
}

/** The number in "وعي 111 | ..." (or the feed's bare "٩٥ | ..."); null if the title isn't numbered. */
export function parseEpisodeNumber(title: string): number | null {
  const match = toAsciiDigits(title).match(/^\s*(?:وعي\s+(\d+)|(\d+)\s*\|)/);
  return match ? Number(match[1] ?? match[2]) : null;
}

/** Title comparison that survives the spelling drift between YouTube and the feed (hamza forms, diacritics, punctuation). */
export function normalizeTitle(title: string): string {
  return toAsciiDigits(title)
    .normalize("NFKC")
    .replace(/[ً-ٰٟـ]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");
}

function parseDuration(value: string): number {
  const parts = value.trim().split(":").map(Number);
  if (parts.some((part) => !Number.isFinite(part))) return 0;
  return parts.reduce((total, part) => total * 60 + part, 0);
}

const decodeXml = (value: string) =>
  value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();

/** Reads the items of an RSS document. Deliberately tolerant: an item it can't make sense of is skipped, never fatal. */
export function parseFeed(xml: string): FeedItem[] {
  const items: FeedItem[] = [];
  for (const [, body] of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const tag = (name: string) => {
      const match = body.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`));
      return match ? decodeXml(match[1]) : "";
    };
    const url = body.match(/<enclosure[^>]*\surl="([^"]+)"/)?.[1];
    const title = tag("title");
    const durationSeconds = parseDuration(tag("itunes:duration"));
    if (!url || !title || durationSeconds <= 0 || !/^https:\/\//i.test(decodeXml(url))) continue;
    items.push({ title, url: decodeXml(url), durationSeconds, number: parseEpisodeNumber(title), titleKey: normalizeTitle(title) });
  }
  return items;
}

/** The feed items that are this episode: same number, or same normalised title. */
function sameEpisodeItems(episode: Pick<Episode, "title" | "episodeNumber">, items: FeedItem[]): FeedItem[] {
  const number = episode.episodeNumber ?? parseEpisodeNumber(episode.title);
  const titleKey = normalizeTitle(episode.title);
  return items.filter((item) => (number !== null && item.number === number) || item.titleKey === titleKey);
}

/**
 * The feed item for `episode`: the same episode (same number or title) whose length is closest to
 * the video's. The podcast sometimes carries a differently cut edit (trimmed intro, extended
 * discussion); that is still this episode's audio, and the player converts positions between the
 * two timelines (see convertPosition in lib/playback/item.ts). null only when the feed has no such episode.
 */
export function matchFeedItem(episode: Pick<Episode, "title" | "episodeNumber" | "durationSeconds">, items: FeedItem[]): FeedItem | null {
  let best: FeedItem | null = null;
  let bestDrift = Infinity;
  for (const item of sameEpisodeItems(episode, items)) {
    const drift = Math.abs(item.durationSeconds - episode.durationSeconds);
    if (drift < bestDrift) {
      best = item;
      bestDrift = drift;
    }
  }
  return best;
}

// ---------------------------------------------------------------------------
// Fetching (cached)
// ---------------------------------------------------------------------------

let memo: { items: FeedItem[]; expiresAt: number } | null = null;

async function loadFeed(): Promise<FeedItem[]> {
  const url = siteConfig.podcastFeedUrl;
  if (!url) return [];
  if (memo && memo.expiresAt > Date.now()) return memo.items;

  try {
    const response = await fetch(url, {
      // Next's data cache keeps the feed across requests and instances; the memo above skips re-parsing it every render.
      next: { revalidate: CACHE_SECONDS },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { "user-agent": "WaieSite/1.0 (+podcast feed reader)" },
    });
    if (!response.ok) throw new Error(`Podcast feed responded ${response.status}`);
    const items = parseFeed(await response.text());
    memo = { items, expiresAt: Date.now() + CACHE_SECONDS * 1000 };
    return items;
  } catch (error) {
    // A slow or broken feed must never break an episode page: those episodes just show as watch-only for now.
    console.warn("[audio] podcast feed unavailable:", error instanceof Error ? error.message : error);
    memo = { items: memo?.items ?? [], expiresAt: Date.now() + FAILURE_BACKOFF_MS };
    return memo.items;
  }
}

/**
 * The audio for each episode, keyed by episode id. An explicit `Episode.audioUrl`
 * -- set by an editor, e.g. for an episode the podcast doesn't carry -- always wins
 * over the feed (a full-length file, so it shares the video's timeline).
 */
export async function resolveAudioUrls(episodes: Pick<Episode, "id" | "title" | "episodeNumber" | "durationSeconds" | "audioUrl">[]): Promise<Map<string, AudioSource>> {
  const resolved = new Map<string, AudioSource>();
  const needsFeed = episodes.filter((episode) => !episode.audioUrl);

  for (const episode of episodes) {
    if (episode.audioUrl) resolved.set(episode.id, { url: episode.audioUrl, durationSeconds: episode.durationSeconds });
  }
  if (needsFeed.length === 0) return resolved;

  const items = await loadFeed();
  for (const episode of needsFeed) {
    const match = matchFeedItem(episode, items);
    if (match) resolved.set(episode.id, { url: match.url, durationSeconds: match.durationSeconds });
  }
  return resolved;
}
