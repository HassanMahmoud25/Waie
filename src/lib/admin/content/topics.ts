import { prisma } from "@/lib/db/prisma";
import { slugify, uniqueTopicSlug, randomSlugBase } from "@/lib/sync/slug";
import { AdminContentError } from "@/lib/admin/content/errors";
import type { UpdateTopicInput } from "@/lib/validation/admin-topic";

export { AdminContentError } from "@/lib/admin/content/errors";

/**
 * Admin-only, server-only data access for the topic CMS (Phase 3C). Same
 * shape as lib/admin/content/series.ts/episodes.ts. Topics have no status
 * field (see prisma/schema.prisma) -- there is no publish/unpublish here,
 * only create/update/delete.
 */

const withUsageCounts = { include: { _count: { select: { episodes: true, series: true } } } } as const;

/** Every topic, for the admin list -- identical to contentRepository.listTopics() but includes createdAt/updatedAt for the admin UI. */
export async function listTopicsForAdmin() {
  return prisma.topic.findMany({ ...withUsageCounts, orderBy: { createdAt: "desc" } });
}

export async function getTopicForAdmin(id: string) {
  return prisma.topic.findUnique({ where: { id }, ...withUsageCounts });
}

/** Creates a new topic. See series.ts's createSeries for why a random fallback slug is needed for Arabic titles. */
export async function createTopic(title: string) {
  const base = slugify(title) || randomSlugBase("topic");
  const slug = await uniqueTopicSlug(base);
  return prisma.topic.create({ data: { title, slug }, ...withUsageCounts });
}

/** Updates editorial fields only. `slug` is never hand-edited (generated once at creation). */
export async function updateTopicContent(id: string, patch: UpdateTopicInput) {
  const existing = await prisma.topic.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new AdminContentError("لم يتم العثور على هذا الموضوع.");
  return prisma.topic.update({ where: { id }, data: patch, ...withUsageCounts });
}

/**
 * Deletes a topic only when nothing depends on it. The database's own FKs
 * would not error otherwise -- EpisodeTopic.topicId -> Topic cascades (ON
 * DELETE CASCADE), which would silently strip this topic off every episode
 * that carries it, and Series.topicId -> Topic sets null (ON DELETE SET
 * NULL), which would silently re-categorize any series using it as its
 * topic (see prisma/migrations/*_init/migration.sql). Both are silent
 * content changes, not errors, so this refuses to delete while either
 * relation is non-empty instead of relying on either cascade.
 */
export async function deleteTopic(id: string): Promise<void> {
  const existing = await prisma.topic.findUnique({ where: { id }, ...withUsageCounts });
  if (!existing) throw new AdminContentError("لم يتم العثور على هذا الموضوع.");
  const { episodes, series } = existing._count;
  if (episodes > 0 || series > 0) {
    throw new AdminContentError(
      `لا يمكن حذف موضوع لا يزال مستخدمًا (${episodes} حلقة، ${series} سلسلة). أزل الربط أولًا.`,
    );
  }
  await prisma.topic.delete({ where: { id } });
}
