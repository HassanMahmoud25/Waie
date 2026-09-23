import { prisma } from "@/lib/db/prisma";
import { AdminContentError } from "@/lib/admin/content/errors";
import type { MindMapNode } from "@/types/mind-map";

export { AdminContentError } from "@/lib/admin/content/errors";

/**
 * Admin-only, server-only data access for the Mind Map / Chapters editor
 * (Phase 5G). Talks to Prisma directly -- deliberately separate from
 * src/lib/repositories (the public-facing ContentRepository, whose
 * toMindMap() keeps reading from this exact same MindMap table unchanged).
 * Mirrors lib/admin/content/transcripts.ts's shape: plain functions, never
 * imported from a Client Component, called only by mind-map-actions.ts.
 *
 * MindMap.episodeId is a real `@unique` column (unlike Transcript's
 * composite [episodeId, language] unique), so create-or-update is a single
 * atomic `upsert` rather than a manual find-then-branch.
 */

/** The existing mind map for an episode, if any, in its raw Prisma row shape. */
export async function getMindMapForAdmin(episodeId: string) {
  return prisma.mindMap.findUnique({ where: { episodeId } });
}

/** Safely narrows a MindMap row's opaque Json `nodes` column to its real shape -- mirrors prisma-content-repository.ts's toMindMap(), but falls back to null instead of an unsafe cast so a malformed/legacy row can never crash the admin editor. */
export function toMindMapRoot(nodes: unknown): MindMapNode | null {
  return nodes && typeof nodes === "object" && !Array.isArray(nodes) ? (nodes as unknown as MindMapNode) : null;
}

/**
 * Creates or updates the one mind map for an episode. `root` is
 * JSON-round-tripped before writing: the MindMapNode type's optional fields
 * (description/timestampSeconds) must be genuinely ABSENT keys when unset,
 * never an explicit `undefined` value slipping through from client state --
 * JSON.stringify already drops undefined-valued keys (and, critically,
 * never drops a real `0`), so this is the simplest way to guarantee the
 * stored Json exactly matches what MindMapTree/toMindMap expect to read.
 */
export async function saveMindMap(episodeId: string, title: string, root: MindMapNode) {
  const episode = await prisma.episode.findUnique({ where: { id: episodeId }, select: { slug: true } });
  if (!episode) throw new AdminContentError("لم يتم العثور على هذه الحلقة.");

  const cleanRoot = JSON.parse(JSON.stringify(root)) as MindMapNode;

  await prisma.mindMap.upsert({
    where: { episodeId },
    update: { title, nodes: cleanRoot },
    create: { episodeId, title, nodes: cleanRoot },
  });

  return { episodeSlug: episode.slug };
}

/** Deletes the episode's mind map entirely. Mirrors deleteTranscript's shape (lib/admin/content/transcripts.ts) -- the same established pattern for a destructive, confirmed content delete. */
export async function deleteMindMap(episodeId: string): Promise<{ episodeSlug: string }> {
  const episode = await prisma.episode.findUnique({ where: { id: episodeId }, select: { slug: true } });
  if (!episode) throw new AdminContentError("لم يتم العثور على هذه الحلقة.");

  const existing = await prisma.mindMap.findUnique({ where: { episodeId }, select: { id: true } });
  if (!existing) throw new AdminContentError("لا توجد خريطة لحذفها لهذه الحلقة.");

  await prisma.mindMap.delete({ where: { id: existing.id } });
  return { episodeSlug: episode.slug };
}
