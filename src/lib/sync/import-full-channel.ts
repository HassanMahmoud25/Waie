import { prisma } from "@/lib/db/prisma";
import { listAllPlaylistItems } from "@/lib/youtube/service";
import { getOrResolveChannel } from "./channel";
import { discoverAndSyncPlaylists } from "./playlists";
import { processVideosInBatches } from "./process-videos";
import { describeError, emptyResult, type SyncResult } from "./types";

/**
 * The initial (and re-runnable) archive import: every public upload on the
 * channel, plus every playlist mapped to a Series. Safe to run more than
 * once -- everything downstream is keyed on youtubeVideoId/sourcePlaylistId,
 * so a second run only picks up what's new or changed.
 */
export async function importFullChannel(): Promise<SyncResult> {
  const startedAt = Date.now();
  const result = emptyResult();

  try {
    const channel = await getOrResolveChannel();

    const uploadItems = await listAllPlaylistItems(channel.uploadsPlaylistId);
    result.videosDiscovered = uploadItems.length;
    await processVideosInBatches(
      uploadItems.map((item) => item.videoId),
      result,
    );

    const playlistOutcome = await discoverAndSyncPlaylists(channel.channelId);
    result.playlistsDiscovered = playlistOutcome.playlistsDiscovered;
    result.seriesCreated = playlistOutcome.seriesCreated;
    result.errors.push(...playlistOutcome.errors);

    await prisma.youTubeChannel.update({
      where: { id: channel.id },
      data: { lastFullImportAt: new Date(), lastPlaylistSyncAt: new Date() },
    });
  } catch (error) {
    result.errors.push({ message: describeError(error) });
  }

  result.durationMs = Date.now() - startedAt;
  return result;
}
