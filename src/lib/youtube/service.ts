/**
 * Server-only YouTube boundary. Every function here does real, paginated
 * network calls against the YouTube Data API v3 -- nothing is mocked or
 * fabricated. Callers (the sync layer, admin quick-add) get back clean
 * mapped types from lib/youtube/types.ts, never raw API JSON.
 */
import { youtubeGet, paginateAll, chunk } from "./client";
import { parseIso8601Duration } from "./duration";
import type {
  YouTubeChannelInfo,
  YouTubePlaylistInfo,
  YouTubePlaylistItemInfo,
  YouTubeVideoInfo,
} from "./types";

/** Extracts a YouTube video ID from a full URL or a bare 11-char ID. Used by the admin quick-add form. */
export function parseYouTubeId(value: string): string | null {
  try {
    const url = new URL(value);
    return url.searchParams.get("v") || url.pathname.split("/").filter(Boolean).pop() || null;
  } catch {
    return /^[\w-]{11}$/.test(value) ? value : null;
  }
}

/** Resolves a channel handle (e.g. "@Waie") to its channel ID and uploads-playlist ID. */
export async function resolveChannelByHandle(handle: string): Promise<YouTubeChannelInfo> {
  const normalized = handle.startsWith("@") ? handle : `@${handle}`;
  const data = await youtubeGet<{
    items?: Array<{
      id: string;
      snippet: { title: string };
      contentDetails: { relatedPlaylists: { uploads: string } };
    }>;
  }>("channels", { part: "snippet,contentDetails", forHandle: normalized });

  const item = data.items?.[0];
  if (!item) {
    throw new Error(`Could not resolve YouTube channel for handle "${normalized}".`);
  }

  return {
    channelId: item.id,
    uploadsPlaylistId: item.contentDetails.relatedPlaylists.uploads,
    title: item.snippet.title,
  };
}

/** Fetches full metadata for a single video (used by the admin "paste a URL" quick-add flow). */
export async function fetchVideoMetadata(videoId: string): Promise<YouTubeVideoInfo> {
  const videos = await listVideosByIds([videoId]);
  const video = videos[0];
  if (!video) throw new Error("Video not found, is private, or was removed.");
  return video;
}

/** Every playlist owned by the channel (channel sections/likes playlists excluded -- only channelId-scoped playlists). */
export async function listAllChannelPlaylists(channelId: string): Promise<YouTubePlaylistInfo[]> {
  type Item = {
    id: string;
    snippet: { title: string; description?: string };
    contentDetails: { itemCount: number };
  };
  type Page = { items?: Item[]; nextPageToken?: string };

  const raw = await paginateAll<Item>((pageToken) =>
    youtubeGet<Page>("playlists", {
      part: "snippet,contentDetails",
      channelId,
      maxResults: "50",
      ...(pageToken ? { pageToken } : {}),
    }),
  );

  return raw.map((item) => ({
    playlistId: item.id,
    title: item.snippet.title,
    description: item.snippet.description?.trim() || null,
    itemCount: item.contentDetails.itemCount,
  }));
}

/** Every item (video + position) in a playlist, fully paginated -- covers playlists with thousands of entries. */
export async function listAllPlaylistItems(playlistId: string): Promise<YouTubePlaylistItemInfo[]> {
  type Item = {
    snippet: { position: number; resourceId: { videoId: string; kind: string } };
  };
  type Page = { items?: Item[]; nextPageToken?: string };

  const raw = await paginateAll<Item>((pageToken) =>
    youtubeGet<Page>("playlistItems", {
      part: "snippet",
      playlistId,
      maxResults: "50",
      ...(pageToken ? { pageToken } : {}),
    }),
  );

  return raw
    .filter((item) => item.snippet.resourceId.kind === "youtube#video")
    .map((item) => ({
      videoId: item.snippet.resourceId.videoId,
      playlistId,
      position: item.snippet.position,
    }));
}

/**
 * Full metadata for a batch of video IDs (any size -- internally chunked to
 * the API's 50-per-call limit). Videos that are private, deleted, or
 * otherwise unresolvable are silently omitted rather than throwing, so one
 * bad ID never fails the whole batch; the caller diffs the input/output ID
 * sets to detect skips.
 */
export async function listVideosByIds(videoIds: string[]): Promise<YouTubeVideoInfo[]> {
  if (videoIds.length === 0) return [];

  type Item = {
    id: string;
    snippet: {
      title: string;
      description?: string;
      channelId: string;
      publishedAt: string;
      thumbnails: Record<string, { url: string }>;
    };
    contentDetails: { duration: string };
    status: { privacyStatus: string };
  };

  const results: YouTubeVideoInfo[] = [];
  for (const idBatch of chunk(videoIds, 50)) {
    const data = await youtubeGet<{ items?: Item[] }>("videos", {
      part: "snippet,contentDetails,status",
      id: idBatch.join(","),
      maxResults: "50",
    });

    for (const item of data.items ?? []) {
      const thumbnail =
        item.snippet.thumbnails.maxres ??
        item.snippet.thumbnails.high ??
        item.snippet.thumbnails.medium ??
        item.snippet.thumbnails.default;
      if (!thumbnail) continue;

      results.push({
        videoId: item.id,
        channelId: item.snippet.channelId,
        title: item.snippet.title,
        description: item.snippet.description?.trim() || null,
        thumbnailUrl: thumbnail.url,
        publishedAt: new Date(item.snippet.publishedAt),
        durationSeconds: parseIso8601Duration(item.contentDetails.duration),
        privacyStatus: item.status.privacyStatus,
      });
    }
  }

  return results;
}
