import type { Recommendation as PrismaRecommendation, RecommendationType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { AdminContentError } from "@/lib/admin/content/errors";
import type { RecommendationItemInput } from "@/lib/validation/admin-recommendation";

export { AdminContentError } from "@/lib/admin/content/errors";

/**
 * Admin-only, server-only data access for the Recommendations editor (Phase
 * 5I). Talks to Prisma directly -- deliberately separate from
 * src/lib/repositories (the public-facing ContentRepository, whose
 * getRecommendationsByEpisode() keeps reading from this exact same table
 * unchanged, ordered the same way).
 *
 * Unlike Transcript/MindMap, a Recommendation is a real relational row per
 * item, not one Json blob -- so "one Save persists the whole list" means
 * reconciling the submitted array against the episode's existing rows
 * rather than overwriting a single column:
 *   - a submitted id that matches an existing row -> update it in place
 *   - a submitted id that doesn't exist yet -> create it (the client's
 *     temporary id, e.g. from crypto.randomUUID(), is never written; Prisma
 *     assigns the real cuid)
 *   - an existing row whose id is missing from the submitted list -> delete
 *     it (the admin removed it locally)
 * `order` is normalized to the submitted array's own 0-based index, matching
 * getRecommendationsByEpisode's `orderBy: { order: "asc" }`.
 *
 * Everything runs in one non-interactive array-form $transaction -- this
 * project's established safe pattern for a multi-statement write against
 * the pooled connection (see Phase 5B/5D's PgBouncer notes): it either all
 * succeeds or all fails, with no client-side transaction handle held open
 * across sequential awaits.
 */

export async function getRecommendationsForAdmin(episodeId: string) {
  return prisma.recommendation.findMany({ where: { episodeId }, orderBy: { order: "asc" } });
}

/** The client editor's local-state shape for one recommendation -- optional fields are genuinely absent (undefined), never null, matching every other admin editor's convention in this project. */
export type RecommendationDraft = {
  id: string;
  type: RecommendationType;
  title: string;
  description?: string;
  reason?: string;
  imageUrl?: string;
  url?: string;
  timestampSeconds?: number;
};

export function toRecommendationDraft(row: PrismaRecommendation): RecommendationDraft {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description ?? undefined,
    reason: row.reason ?? undefined,
    imageUrl: row.imageUrl ?? undefined,
    url: row.url ?? undefined,
    timestampSeconds: row.timestampSeconds ?? undefined,
  };
}

export async function saveRecommendations(episodeId: string, items: RecommendationItemInput[]) {
  const episode = await prisma.episode.findUnique({ where: { id: episodeId }, select: { slug: true } });
  if (!episode) throw new AdminContentError("لم يتم العثور على هذه الحلقة.");

  const existing = await prisma.recommendation.findMany({ where: { episodeId }, select: { id: true } });
  const existingIds = new Set(existing.map((row) => row.id));
  const submittedIds = new Set(items.map((item) => item.id));
  const idsToDelete = existing.map((row) => row.id).filter((id) => !submittedIds.has(id));

  const writes = items.map((item, index) => {
    const data = {
      type: item.type,
      title: item.title,
      description: item.description ?? null,
      reason: item.reason ?? null,
      imageUrl: item.imageUrl ?? null,
      url: item.url ?? null,
      timestampSeconds: item.timestampSeconds ?? null,
      order: index,
    };

    return existingIds.has(item.id)
      ? prisma.recommendation.update({ where: { id: item.id }, data })
      : prisma.recommendation.create({ data: { ...data, episodeId } });
  });

  await prisma.$transaction([
    ...(idsToDelete.length > 0 ? [prisma.recommendation.deleteMany({ where: { id: { in: idsToDelete } } })] : []),
    ...writes,
  ]);

  return { episodeSlug: episode.slug };
}
