import { prisma } from "@/lib/db/prisma";

/**
 * Creates one NEW_EPISODE notification per follower of the episode's series
 * (Phase 4C). Called only from publishEpisode() (see
 * lib/admin/content/episodes.ts), and only on the actual DRAFT/ARCHIVED ->
 * PUBLISHED transition -- never on edits to an already-published episode,
 * never on unpublish. This is the one and only place Notification rows get
 * created.
 *
 * Idempotent by construction, not just by the caller's transition check:
 * Notification's `@@unique([userId, type, episodeId])` (see
 * prisma/schema.prisma) is the real guarantee, and createMany's
 * `skipDuplicates` relies on it -- a repeat call for the same episode is a
 * no-op rather than a duplicate row or an error.
 *
 * Reuses FollowedSeries' `@@index([seriesId])` (added in Phase 4A for
 * exactly this) -- one query for the follower ids, one createMany for the
 * notifications. No per-follower request, no loading of unrelated user rows.
 */
export async function notifyFollowersOfNewEpisode(episode: {
  id: string;
  slug: string;
  title: string | null;
  youtubeTitle: string;
  series: { id: string; title: string } | null;
}): Promise<void> {
  if (!episode.series) return;

  const followers = await prisma.followedSeries.findMany({
    where: { seriesId: episode.series.id },
    select: { userId: true },
  });
  if (followers.length === 0) return;

  const episodeTitle = episode.title ?? episode.youtubeTitle;

  await prisma.notification.createMany({
    data: followers.map(({ userId }) => ({
      userId,
      type: "NEW_EPISODE" as const,
      title: `حلقة جديدة في ${episode.series!.title}`,
      message: episodeTitle,
      href: `/episodes/${episode.slug}`,
      episodeId: episode.id,
    })),
    skipDuplicates: true,
  });
}
