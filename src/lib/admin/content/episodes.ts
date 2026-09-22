import { prisma } from "@/lib/db/prisma";
import { parseYouTubeId, fetchVideoMetadata } from "@/lib/youtube/service";
import { slugify, uniqueEpisodeSlug } from "@/lib/sync/slug";
import type { UpdateEpisodeContentInput } from "@/lib/validation/admin-episode";

/**
 * Admin-only, server-only data access for the episode CMS foundation
 * (Phase 3A). Talks to Prisma directly -- deliberately separate from
 * `src/lib/repositories` (the public-facing ContentRepository), which stays
 * untouched and status-filtered. Nothing here is a Server Action: these are
 * plain functions called by lib/admin/content/actions.ts, which is the only
 * thing that ever runs requireAdmin() and is the only boundary a client
 * component can invoke. Never import this file from a Client Component.
 *
 * Returns Prisma's own row shapes rather than the narrow public `Episode`
 * type (src/types/episode.ts) -- admin editing needs fields the public type
 * doesn't carry (youtubeTitle/youtubeDescription, seoTitle/seoDescription,
 * seriesOrder, ...). `getEpisodeForAdmin`'s row is passed to the Client
 * Component editor (src/components/admin/episode-editor.tsx) as a plain
 * serializable prop -- still never imported directly by a Client Component.
 */

const episodeWithTopics = { include: { topics: true, series: { select: { slug: true } } } } as const;

export class AdminContentError extends Error {}

/** Every episode regardless of status, for a future admin list/edit view. */
export async function getEpisodeForAdmin(id: string) {
  return prisma.episode.findUnique({ where: { id }, ...episodeWithTopics });
}

/**
 * Creates a new episode as a DRAFT from a pasted YouTube URL or bare video
 * id, fetching real metadata via the existing lib/youtube/service.ts utility
 * (never a second implementation). This is intentionally the full extent of
 * YouTube integration for this phase -- no playlist scanning, no bulk
 * import; see the file-level comment in lib/youtube/service.ts for the
 * existing sync system that already does that separately.
 *
 * Always DRAFT, regardless of Episode.status's schema default (PUBLISHED,
 * which exists only for the unrelated sync/import path in lib/sync/**) --
 * a CMS-created episode must always start unpublished for editorial review.
 */
export async function createDraftEpisodeFromYouTube(youtubeUrlOrId: string) {
  const videoId = parseYouTubeId(youtubeUrlOrId);
  if (!videoId) {
    throw new AdminContentError("تعذّر التعرّف على رابط يوتيوب أو معرّف الفيديو.");
  }

  const existing = await prisma.episode.findUnique({ where: { youtubeVideoId: videoId }, select: { id: true, slug: true } });
  if (existing) {
    throw new AdminContentError("هذه الحلقة موجودة بالفعل. عدّلها بدلًا من إنشائها من جديد.");
  }

  const video = await fetchVideoMetadata(videoId);

  const base = slugify(video.title) || `waie-${video.videoId}`;
  const slug = await uniqueEpisodeSlug(base);

  return prisma.episode.create({
    data: {
      slug,
      youtubeVideoId: video.videoId,
      youtubeUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
      youtubeChannelId: video.channelId,
      youtubeTitle: video.title,
      youtubeDescription: video.description,
      youtubeThumbnailUrl: video.thumbnailUrl,
      youtubeDurationSeconds: video.durationSeconds,
      youtubePublishedAt: video.publishedAt,
      status: "DRAFT",
    },
    ...episodeWithTopics,
  });
}

/**
 * Updates editorial content only -- never youtube*-prefixed fields (those
 * are sync-owned, see prisma/schema.prisma's own comment on Episode), never
 * `status` (see publishEpisode/unpublishEpisode below), and never anything
 * client-supplied beyond what updateEpisodeContentSchema already validated.
 * `topicIds`, when provided, atomically replaces the episode's EpisodeTopic
 * rows; when omitted entirely, topics are left untouched.
 */
export async function updateEpisodeContent(id: string, patch: UpdateEpisodeContentInput) {
  const existing = await prisma.episode.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new AdminContentError("لم يتم العثور على هذه الحلقة.");

  if (patch.seriesId) {
    const series = await prisma.series.findUnique({ where: { id: patch.seriesId }, select: { id: true } });
    if (!series) throw new AdminContentError("السلسلة المحددة غير موجودة.");
  }

  if (patch.topicIds) {
    const count = await prisma.topic.count({ where: { id: { in: patch.topicIds } } });
    if (count !== patch.topicIds.length) throw new AdminContentError("أحد المواضيع المحددة غير موجود.");
  }

  const { topicIds, ...rest } = patch;

  return prisma.$transaction(async (tx) => {
    await tx.episode.update({ where: { id }, data: rest });

    if (topicIds) {
      await tx.episodeTopic.deleteMany({ where: { episodeId: id } });
      if (topicIds.length > 0) {
        await tx.episodeTopic.createMany({
          data: topicIds.map((topicId) => ({ episodeId: id, topicId })),
          skipDuplicates: true,
        });
      }
    }

    return tx.episode.findUniqueOrThrow({ where: { id }, include: { topics: true, series: { select: { slug: true } } } });
  });
}

/**
 * The minimum bar for going live: assigned to a series or at least one
 * topic, so a published episode is never left uncategorized on the public
 * site (it would otherwise never surface on any series/topic page, only by
 * direct link). A deliberate, narrow rule -- not a stand-in for a full
 * editorial checklist -- easy to relax or extend later.
 */
async function assertMinimumContentForPublish(episodeId: string): Promise<void> {
  const episode = await prisma.episode.findUnique({
    where: { id: episodeId },
    include: { topics: true },
  });
  if (!episode) throw new AdminContentError("لم يتم العثور على هذه الحلقة.");

  const hasSeries = Boolean(episode.seriesId);
  const hasTopic = episode.topics.length > 0;
  if (!hasSeries && !hasTopic) {
    throw new AdminContentError("لا يمكن النشر قبل تصنيف الحلقة ضمن سلسلة أو موضوع واحد على الأقل.");
  }
}

/** Publishes an episode. Returns the updated row (with its series slug, for cache revalidation). */
export async function publishEpisode(id: string) {
  const existing = await prisma.episode.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new AdminContentError("لم يتم العثور على هذه الحلقة.");

  await assertMinimumContentForPublish(id);

  return prisma.episode.update({
    where: { id },
    data: { status: "PUBLISHED" },
    include: { series: { select: { slug: true } } },
  });
}

/** Unpublishes an episode back to DRAFT. Never deletes anything. */
export async function unpublishEpisode(id: string) {
  const existing = await prisma.episode.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new AdminContentError("لم يتم العثور على هذه الحلقة.");

  return prisma.episode.update({
    where: { id },
    data: { status: "DRAFT" },
    include: { series: { select: { slug: true } } },
  });
}
