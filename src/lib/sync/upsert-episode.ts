import { prisma } from "@/lib/db/prisma";
import type { YouTubeVideoInfo } from "@/lib/youtube/types";
import { slugify, uniqueEpisodeSlug } from "./slug";

export type UpsertOutcome = "created" | "updated" | "skipped";

/**
 * The single write path for a YouTube video becoming/staying an Episode row.
 * `youtubeVideoId` is the idempotency key. Critically: the update branch
 * only ever assigns youtube*-prefixed columns -- title, description,
 * thumbnailUrl, seriesOrder, featured, seoTitle, seoDescription, status and
 * every other editorial column are never referenced here, so an admin's
 * edits can never be clobbered by a later sync run.
 */
export async function upsertEpisodeFromYouTube(video: YouTubeVideoInfo): Promise<UpsertOutcome> {
  const existing = await prisma.episode.findUnique({ where: { youtubeVideoId: video.videoId } });
  const youtubeUrl = `https://www.youtube.com/watch?v=${video.videoId}`;

  if (!existing) {
    const base = slugify(video.title) || `waie-${video.videoId}`;
    const slug = await uniqueEpisodeSlug(base);

    await prisma.episode.create({
      data: {
        slug,
        youtubeVideoId: video.videoId,
        youtubeUrl,
        youtubeChannelId: video.channelId,
        youtubeTitle: video.title,
        youtubeDescription: video.description,
        youtubeThumbnailUrl: video.thumbnailUrl,
        youtubeDurationSeconds: video.durationSeconds,
        youtubePublishedAt: video.publishedAt,
      },
    });
    return "created";
  }

  const changed =
    existing.youtubeTitle !== video.title ||
    existing.youtubeDescription !== video.description ||
    existing.youtubeThumbnailUrl !== video.thumbnailUrl ||
    existing.youtubeDurationSeconds !== video.durationSeconds ||
    existing.youtubeChannelId !== video.channelId ||
    existing.youtubeUrl !== youtubeUrl ||
    existing.youtubePublishedAt.getTime() !== video.publishedAt.getTime();

  if (!changed) return "skipped";

  await prisma.episode.update({
    where: { id: existing.id },
    data: {
      youtubeUrl,
      youtubeChannelId: video.channelId,
      youtubeTitle: video.title,
      youtubeDescription: video.description,
      youtubeThumbnailUrl: video.thumbnailUrl,
      youtubeDurationSeconds: video.durationSeconds,
      youtubePublishedAt: video.publishedAt,
    },
  });
  return "updated";
}
