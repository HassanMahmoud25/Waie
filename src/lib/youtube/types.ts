/**
 * Clean, mapped shapes this codebase works with -- never the raw YouTube
 * Data API response shape, which is verbose and versioned separately from
 * anything we control. lib/youtube/client.ts + service.ts are the only
 * files that see the raw API JSON.
 */

export type YouTubeChannelInfo = {
  channelId: string;
  uploadsPlaylistId: string;
  title: string;
};

export type YouTubePlaylistInfo = {
  playlistId: string;
  title: string;
  description: string | null;
  itemCount: number;
};

export type YouTubePlaylistItemInfo = {
  videoId: string;
  playlistId: string;
  /** 0-based position within the playlist, as reported by YouTube. */
  position: number;
};

export type YouTubeVideoInfo = {
  videoId: string;
  channelId: string;
  title: string;
  description: string | null;
  thumbnailUrl: string;
  publishedAt: Date;
  durationSeconds: number;
  /** "public" | "unlisted" | "private" -- private/removed videos are filtered out before this point. */
  privacyStatus: string;
};
