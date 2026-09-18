import { listVideosByIds } from "@/lib/youtube/service";
import { chunk } from "@/lib/youtube/client";
import { upsertEpisodeFromYouTube } from "./upsert-episode";
import { describeError, type SyncResult } from "./types";

/**
 * Shared by every sync operation that touches video metadata. Batches IDs
 * to the API's 50-per-call limit, and isolates failures at three levels so
 * a single bad video/batch never loses the rest of the run:
 *  - a whole batch failing (network/quota) marks every ID in it as an error
 *  - an ID YouTube can no longer resolve (private/deleted) counts as skipped
 *  - a single DB write failing is caught per-video
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
        const outcome = await upsertEpisodeFromYouTube(video);
        if (outcome === "created") result.videosCreated += 1;
        else if (outcome === "updated") result.videosUpdated += 1;
        else result.videosSkipped += 1;
      } catch (error) {
        result.errors.push({ videoId: video.videoId, message: describeError(error) });
      }
    }
  }
}
