import { prisma } from "@/lib/db/prisma";
import { getOrResolveChannel } from "./channel";
import { processVideosInBatches } from "./process-videos";
import { describeError, emptyResult, type SyncResult } from "./types";

/**
 * Refreshes YouTube-owned fields (title, description, thumbnail, duration,
 * publish date) for every episode already imported. Editorial fields are
 * never part of this path -- see upsert-episode.ts.
 */
export async function syncMetadata(): Promise<SyncResult> {
  const startedAt = Date.now();
  const result = emptyResult();

  try {
    const channel = await getOrResolveChannel();
    const episodes = await prisma.episode.findMany({ select: { youtubeVideoId: true } });
    result.videosDiscovered = episodes.length;

    await processVideosInBatches(
      episodes.map((episode) => episode.youtubeVideoId),
      result,
    );

    await prisma.youTubeChannel.update({
      where: { id: channel.id },
      data: { lastMetadataSyncAt: new Date() },
    });
  } catch (error) {
    result.errors.push({ message: describeError(error) });
  }

  result.durationMs = Date.now() - startedAt;
  return result;
}
