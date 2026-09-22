import { prisma } from "@/lib/db/prisma";
import { slugify, uniqueCollectionSlug, randomSlugBase } from "@/lib/sync/slug";
import { AdminContentError } from "@/lib/admin/content/errors";
import type { UpdateCollectionInput } from "@/lib/validation/admin-collection";

export { AdminContentError } from "@/lib/admin/content/errors";

/**
 * Admin-only, server-only data access for the collection CMS (Phase 3D).
 * Same shape as lib/admin/content/series.ts/topics.ts: talks to Prisma
 * directly, kept deliberately separate from src/lib/repositories (the
 * public-facing ContentRepository, which stays untouched and
 * status-filtered). Nothing here is a Server Action -- these are plain
 * functions called by lib/admin/content/collection-actions.ts, the only
 * thing that ever runs requireAdmin(). Never import this file from a
 * Client Component.
 *
 * `coverImage` and `kind` exist on the Prisma Collection model but neither
 * is read anywhere in the public site: prisma-content-repository.ts's
 * toCollection() doesn't map coverImage at all (the public collection cards
 * on `/` and `/collections` derive their image from the *first assigned
 * episode's thumbnail* instead -- see src/app/(site)/collections/page.tsx),
 * and `kind` has zero readers anywhere in the repo, always "EDITORIAL".
 * Both are left out of the editable field set below rather than exposing
 * dead controls -- pre-existing technical debt, not something this phase
 * expands.
 */

const withItems = {
  include: { items: { orderBy: { position: "asc" as const } }, _count: { select: { items: true } } },
} as const;

/** Every collection regardless of status, for the admin list. */
export async function listCollectionsForAdmin() {
  return prisma.collection.findMany({ ...withItems, orderBy: { createdAt: "desc" } });
}

export async function getCollectionForAdmin(id: string) {
  return prisma.collection.findUnique({ where: { id }, ...withItems });
}

/**
 * Creates a new collection as a DRAFT (matches the schema's own default, set
 * explicitly here for clarity) -- never auto-published, exactly like a
 * CMS-created series/episode. Most Waie titles are Arabic, so
 * slugify(title) alone usually collapses to "" -- randomSlugBase() supplies
 * a fallback (see series.ts/topics.ts for the same pattern).
 */
export async function createCollection(title: string) {
  const base = slugify(title) || randomSlugBase("collection");
  const slug = await uniqueCollectionSlug(base);
  return prisma.collection.create({ data: { title, slug, status: "DRAFT" }, ...withItems });
}

/** Updates editorial content only -- never `status` and never `slug`. */
export async function updateCollectionContent(id: string, patch: UpdateCollectionInput) {
  const existing = await prisma.collection.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new AdminContentError("لم يتم العثور على هذه المجموعة.");
  return prisma.collection.update({ where: { id }, data: patch, ...withItems });
}

export async function publishCollection(id: string) {
  const existing = await prisma.collection.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new AdminContentError("لم يتم العثور على هذه المجموعة.");
  return prisma.collection.update({ where: { id }, data: { status: "PUBLISHED" }, ...withItems });
}

/** Unpublishes a collection back to DRAFT. Never deletes anything, never touches its episodes. */
export async function unpublishCollection(id: string) {
  const existing = await prisma.collection.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new AdminContentError("لم يتم العثور على هذه المجموعة.");
  return prisma.collection.update({ where: { id }, data: { status: "DRAFT" }, ...withItems });
}

/**
 * Deletes a collection. Unlike Series/Topic, this is unconditionally safe:
 * CollectionItem.collectionId -> Collection is ON DELETE CASCADE (see
 * prisma/migrations/*_init/migration.sql), but the cascade target is the
 * join table itself -- deleting a Collection only removes its
 * CollectionItem rows (the membership list), and never touches an Episode
 * row (Episode is the *other* side of that join, not part of this cascade
 * chain). No episode is ever modified or deleted by this.
 */
export async function deleteCollection(id: string): Promise<void> {
  const existing = await prisma.collection.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new AdminContentError("لم يتم العثور على هذه المجموعة.");
  await prisma.collection.delete({ where: { id } });
}

async function getCollectionSlug(collectionId: string): Promise<string> {
  const row = await prisma.collection.findUniqueOrThrow({ where: { id: collectionId }, select: { slug: true } });
  return row.slug;
}

/** Adds an episode to a collection at the end of its current order. Never modifies the episode itself. */
export async function addCollectionEpisode(collectionId: string, episodeId: string): Promise<string> {
  const collection = await prisma.collection.findUnique({ where: { id: collectionId }, select: { id: true } });
  if (!collection) throw new AdminContentError("لم يتم العثور على هذه المجموعة.");

  const episode = await prisma.episode.findUnique({ where: { id: episodeId }, select: { id: true } });
  if (!episode) throw new AdminContentError("لم يتم العثور على هذه الحلقة.");

  const alreadyIn = await prisma.collectionItem.findFirst({ where: { collectionId, episodeId }, select: { collectionId: true } });
  if (alreadyIn) throw new AdminContentError("هذه الحلقة مضافة بالفعل إلى المجموعة.");

  const { _max } = await prisma.collectionItem.aggregate({ where: { collectionId }, _max: { position: true } });
  await prisma.collectionItem.create({ data: { collectionId, episodeId, position: (_max.position ?? -1) + 1 } });
  return getCollectionSlug(collectionId);
}

/** Removes an episode from a collection. Only deletes the CollectionItem join row -- the Episode itself is never touched. */
export async function removeCollectionEpisode(collectionId: string, episodeId: string): Promise<string> {
  const result = await prisma.collectionItem.deleteMany({ where: { collectionId, episodeId } });
  if (result.count === 0) throw new AdminContentError("هذه الحلقة ليست ضمن المجموعة.");
  return getCollectionSlug(collectionId);
}

/**
 * Swaps an episode's position with its neighbor in the given direction. A
 * no-op (not an error) when the episode is already at that edge of the
 * list -- re-derives the live order from the database rather than trusting
 * a client-supplied position, so a stale client view can't corrupt order.
 */
export async function moveCollectionEpisode(
  collectionId: string,
  episodeId: string,
  direction: "up" | "down",
): Promise<string> {
  const items = await prisma.collectionItem.findMany({ where: { collectionId }, orderBy: { position: "asc" } });
  const index = items.findIndex((item) => item.episodeId === episodeId);
  if (index === -1) throw new AdminContentError("هذه الحلقة ليست ضمن المجموعة.");

  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= items.length) return getCollectionSlug(collectionId);

  const a = items[index];
  const b = items[swapWith];
  await prisma.$transaction([
    prisma.collectionItem.update({
      where: { collectionId_episodeId: { collectionId, episodeId: a.episodeId } },
      data: { position: b.position },
    }),
    prisma.collectionItem.update({
      where: { collectionId_episodeId: { collectionId, episodeId: b.episodeId } },
      data: { position: a.position },
    }),
  ]);
  return getCollectionSlug(collectionId);
}
