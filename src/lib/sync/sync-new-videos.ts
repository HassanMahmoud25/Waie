import { prisma } from "@/lib/db/prisma";
import { listAllPlaylistItems } from "@/lib/youtube/service";
import { getOrResolveChannel } from "./channel";
import { processVideosInBatches } from "./process-videos";
import { describeError, emptyResult, type SyncResult } from "./types";

/**
 * Cheaper than a full import: lists the uploads playlist (still fully
 * paginated -- never assumes new videos are only on page one), diffs
 * against known youtubeVideoIds, and only fetches full metadata for the
 * ones that are actually new.
 */
export async function syncNewVideos(): Promise<SyncResult> {
  const startedAt = Date.now();
  const result = emptyResult();

  try {
    const channel = await getOrResolveChannel();
    const items = await listAllPlaylistItems(channel.uploadsPlaylistId);
    result.videosDiscovered = items.length;

    const existing = await prisma.episode.findMany({
      where: { youtubeVideoId: { in: items.map((item) => item.videoId) } },
      select: { youtubeVideoId: true },
    });
    const existingIds = new Set(existing.map((row) => row.youtubeVideoId));
    const newIds = items.map((item) => item.videoId).filter((id) => !existingIds.has(id));
    result.videosSkipped = items.length - newIds.length;

    await processVideosInBatches(newIds, result);

    await prisma.youTubeChannel.update({
      where: { id: channel.id },
      data: { lastVideoSyncAt: new Date() },
    });
  } catch (error) {
    result.errors.push({ message: describeError(error) });
  }

  result.durationMs = Date.now() - startedAt;
  return result;
}
