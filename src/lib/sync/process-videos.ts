import { prisma } from "@/lib/db/prisma";
import { listVideosByIds } from "@/lib/youtube/service";
import { chunk } from "@/lib/youtube/client";
import type { YouTubeVideoInfo } from "@/lib/youtube/types";
import { classifyVideo } from "./classify-video";
import { upsertEpisodeFromYouTube } from "./upsert-episode";
import { upsertShortFromYouTube } from "./upsert-short";
import { describeError, type SyncResult } from "./types";

/**
 * Shared by every sync operation that touches video metadata. Batches IDs
 * to the API's 50-per-call limit, and isolates failures at three levels so
 * a single bad video/batch never loses the rest of the run:
 *  - a whole batch failing (network/quota) marks every ID in it as an error
 *  - an ID YouTube can no longer resolve (private/deleted) counts as skipped
 *  - a single DB write failing is caught per-video
 *
 * Every video is classified (see classify-video.ts) BEFORE either upsert
 * function is ever called -- this is the fork point Phase 5A identified as
 * missing, and the only place a video becomes an Episode or a Short. See
 * routeClassifiedVideo below for exactly how each of the three outcomes
 * (EPISODE / SHORT / UNKNOWN) is handled.
 */
export async function processVideosInBatches(videoIds: string[], result: SyncResult): Promise<void> {
  for (const idBatch of chunk(videoIds, 50)) {
    let videos;
    try {
      videos = await listVideosByIds(idBatch);
    } catch (error) {
      const message = describeError(error);
      for (const videoId of idBatch) result.errors.push({ videoId, message });
      continue;
    }

    const foundIds = new Set(videos.map((video) => video.videoId));
    result.videosSkipped += idBatch.filter((id) => !foundIds.has(id)).length;

    for (const video of videos) {
      try {
        await routeClassifiedVideo(video, result);
      } catch (error) {
        result.errors.push({ videoId: video.videoId, message: describeError(error) });
      }
    }
  }
}

async function routeClassifiedVideo(video: YouTubeVideoInfo, result: SyncResult): Promise<void> {
  const classification = await classifyVideo(video);

  if (classification === "SHORT") {
    const outcome = await upsertShortFromYouTube(video);
    if (outcome === "created") result.shortsCreated += 1;
    else if (outcome === "updated") result.shortsUpdated += 1;
    else result.videosSkipped += 1;
    return;
  }

  if (classification === "UNKNOWN") {
    // Never silently guess: an inconclusive classification must never become
    // an accidental Episode (or Short). If this video already exists as
    // either, leave it exactly as it is -- a transient probe failure on a
    // resync must not stall or alter already-classified content. If it's
    // genuinely new, don't create anything at all; just record it so an
    // admin can look at the actual video and decide.
    const [existingEpisode, existingShort] = await Promise.all([
      prisma.episode.findUnique({ where: { youtubeVideoId: video.videoId }, select: { id: true } }),
      prisma.short.findUnique({ where: { youtubeVideoId: video.videoId }, select: { id: true } }),
    ]);
    if (!existingEpisode && !existingShort) {
      result.videosUnknown += 1;
      result.unknownVideoIds.push(video.videoId);
    }
    return;
  }

  // classification === "EPISODE"
  const outcome = await upsertEpisodeFromYouTube(video);
  if (outcome === "created") result.videosCreated += 1;
  else if (outcome === "updated") result.videosUpdated += 1;
  else result.videosSkipped += 1;
}
