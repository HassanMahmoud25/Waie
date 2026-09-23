import { prisma } from "@/lib/db/prisma";
import type { YouTubeVideoInfo } from "@/lib/youtube/types";
import { slugify, uniqueShortSlug } from "./slug";

export type UpsertOutcome = "created" | "updated" | "skipped";

/**
 * The single write path for a YouTube video classified SHORT (see
 * classify-video.ts) becoming/staying a Short row. Mirrors
 * upsertEpisodeFromYouTube's shape exactly -- `youtubeVideoId` is the
 * idempotency key -- but writes to the structurally separate `Short` model
 * and never touches `Episode` in any way. There is no shared identity
 * between the two: a video id can exist as an Episode row or a Short row,
 * never contribute to both, and this function has no code path that could
 * create an Episode.
 */
export async function upsertShortFromYouTube(video: YouTubeVideoInfo): Promise<UpsertOutcome> {
  const existing = await prisma.short.findUnique({ where: { youtubeVideoId: video.videoId } });

  if (!existing) {
    const base = slugify(video.title) || `waie-${video.videoId}`;
    const slug = await uniqueShortSlug(base);

    await prisma.short.create({
      data: {
        slug,
        youtubeVideoId: video.videoId,
        youtubeTitle: video.title,
        youtubeThumbnailUrl: video.thumbnailUrl,
        youtubeDurationSeconds: video.durationSeconds,
        youtubePublishedAt: video.publishedAt,
        // Explicit, not relied on as the column's own default -- mirrors
        // createDraftEpisodeFromYouTube's reasoning (lib/admin/content/episodes.ts):
        // newly-discovered content always starts unpublished for editorial
        // review, regardless of what the schema default happens to be.
        status: "DRAFT",
      },
    });
    return "created";
  }

  const changed =
    existing.youtubeTitle !== video.title ||
    existing.youtubeThumbnailUrl !== video.thumbnailUrl ||
    existing.youtubeDurationSeconds !== video.durationSeconds ||
    existing.youtubePublishedAt.getTime() !== video.publishedAt.getTime();

  if (!changed) return "skipped";

  // Same rule as upsertEpisodeFromYouTube's update branch: only youtube*
  // metadata is ever touched here. `status` is never referenced, so an
  // admin's publish/unpublish decision on an existing Short always survives
  // a later sync run.
  await prisma.short.update({
    where: { id: existing.id },
    data: {
      youtubeTitle: video.title,
      youtubeThumbnailUrl: video.thumbnailUrl,
      youtubeDurationSeconds: video.durationSeconds,
      youtubePublishedAt: video.publishedAt,
    },
  });
  return "updated";
}
