import { prisma } from "@/lib/db/prisma";
import { slugify, uniqueSeriesSlug, randomSlugBase } from "@/lib/sync/slug";
import { AdminContentError } from "@/lib/admin/content/errors";
import type { UpdateSeriesContentInput } from "@/lib/validation/admin-series";

export { AdminContentError } from "@/lib/admin/content/errors";

/**
 * Admin-only, server-only data access for the series CMS (Phase 3C). Same
 * shape as lib/admin/content/episodes.ts: talks to Prisma directly, kept
 * deliberately separate from src/lib/repositories (the public-facing
 * ContentRepository, which stays untouched and status-filtered). Nothing
 * here is a Server Action -- these are plain functions called by
 * lib/admin/content/series-actions.ts, the only thing that ever runs
 * requireAdmin(). Never import this file from a Client Component.
 */

const withEpisodeCount = { include: { _count: { select: { episodes: true } } } } as const;

/** Every series regardless of status, for the admin list. */
export async function listSeriesForAdmin() {
  return prisma.series.findMany({ ...withEpisodeCount, orderBy: { createdAt: "desc" } });
}

export async function getSeriesForAdmin(id: string) {
  return prisma.series.findUnique({ where: { id }, ...withEpisodeCount });
}

/**
 * Creates a new series as a DRAFT (matches the schema's own default, set
 * explicitly here for clarity) -- a CMS-created series always starts
 * unpublished for editorial review, exactly like a CMS-created episode.
 * Most Waie titles are Arabic, so slugify(title) alone usually collapses to
 * "" -- unlike an episode there's no natural ASCII id to fall back to
 * (no YouTube video), so randomSlugBase() supplies one instead.
 */
export async function createSeries(title: string) {
  const base = slugify(title) || randomSlugBase("series");
  const slug = await uniqueSeriesSlug(base);
  return prisma.series.create({ data: { title, slug, status: "DRAFT" }, ...withEpisodeCount });
}

/**
 * Updates editorial content only -- never `status` (see
 * publishSeries/unpublishSeries below) and never `slug`. `topicId`, when
 * provided, is validated against a real Topic before writing.
 */
export async function updateSeriesContent(id: string, patch: UpdateSeriesContentInput) {
  const existing = await prisma.series.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new AdminContentError("لم يتم العثور على هذه السلسلة.");

  if (patch.topicId) {
    const topic = await prisma.topic.findUnique({ where: { id: patch.topicId }, select: { id: true } });
    if (!topic) throw new AdminContentError("الموضوع المحدد غير موجود.");
  }

  return prisma.series.update({ where: { id }, data: patch, ...withEpisodeCount });
}

export async function publishSeries(id: string) {
  const existing = await prisma.series.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new AdminContentError("لم يتم العثور على هذه السلسلة.");
  return prisma.series.update({ where: { id }, data: { status: "PUBLISHED" }, ...withEpisodeCount });
}

/** Unpublishes a series back to DRAFT. Never deletes anything, never touches its episodes. */
export async function unpublishSeries(id: string) {
  const existing = await prisma.series.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new AdminContentError("لم يتم العثور على هذه السلسلة.");
  return prisma.series.update({ where: { id }, data: { status: "DRAFT" }, ...withEpisodeCount });
}

/**
 * Deletes a series only when nothing depends on it. The database's own FK
 * (Episode.seriesId -> Series, ON DELETE SET NULL -- see
 * prisma/migrations/*_init/migration.sql) would silently detach any
 * episode still assigned to it rather than error, which would silently
 * un-categorize real content -- so this refuses to delete while any
 * episode still references the series, instead of relying on that cascade.
 * (FollowedSeries rows cascade-delete along with the series itself, which is
 * expected: a user's "follow" on a series that no longer exists.)
 */
export async function deleteSeries(id: string): Promise<void> {
  const existing = await prisma.series.findUnique({ where: { id }, ...withEpisodeCount });
  if (!existing) throw new AdminContentError("لم يتم العثور على هذه السلسلة.");
  if (existing._count.episodes > 0) {
    throw new AdminContentError(
      `لا يمكن حذف سلسلة مرتبطة بحلقات (${existing._count.episodes}). أزل الحلقات من هذه السلسلة أولًا.`,
    );
  }
  await prisma.series.delete({ where: { id } });
}
