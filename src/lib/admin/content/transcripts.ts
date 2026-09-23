import { prisma } from "@/lib/db/prisma";
import { AdminContentError } from "@/lib/admin/content/errors";
import type { TranscriptSegmentInput } from "@/lib/validation/admin-transcript";
import type { TranscriptSegment } from "@/types/transcript";

export { AdminContentError } from "@/lib/admin/content/errors";

/**
 * Admin-only, server-only data access for the Transcript editor (Phase 5E).
 * Talks to Prisma directly -- deliberately separate from
 * src/lib/repositories (the public-facing ContentRepository, whose
 * toTranscript() keeps reading from this exact same Transcript table
 * unchanged). Mirrors lib/admin/content/episodes.ts's shape: plain
 * functions, never imported from a Client Component, called only by
 * transcript-actions.ts.
 *
 * There is at most one Transcript per episode in practice (the public
 * reader and every admin fetch below assume a single row), even though the
 * schema's unique constraint is technically per [episodeId, language] --
 * this app has no multi-language admin UI, so language is never presented
 * as a choice here.
 */

/** The existing transcript for an episode, if any, in its raw Prisma row shape. */
export async function getTranscriptForAdmin(episodeId: string) {
  return prisma.transcript.findFirst({ where: { episodeId } });
}

/** Safely narrows a Transcript row's opaque Json `segments` column to its real shape -- mirrors prisma-content-repository.ts's toTranscript() exactly, since both read the same column. */
export function toTranscriptSegments(segments: unknown): TranscriptSegment[] {
  return Array.isArray(segments) ? (segments as unknown as TranscriptSegment[]) : [];
}

/**
 * Creates or updates the one transcript for an episode. `language` is never
 * touched on an update (preserved exactly as it already is); a brand-new
 * transcript is created with the schema's own default ("ar") -- the only
 * language any content in this app has ever used.
 */
export async function saveTranscript(episodeId: string, segments: TranscriptSegmentInput[]) {
  const episode = await prisma.episode.findUnique({ where: { id: episodeId }, select: { id: true, slug: true } });
  if (!episode) throw new AdminContentError("لم يتم العثور على هذه الحلقة.");

  const existing = await prisma.transcript.findFirst({ where: { episodeId }, select: { id: true } });

  if (existing) {
    await prisma.transcript.update({ where: { id: existing.id }, data: { segments } });
  } else {
    await prisma.transcript.create({ data: { episodeId, language: "ar", segments } });
  }

  return { episodeSlug: episode.slug };
}

/** Deletes the episode's transcript entirely. Mirrors deleteCollection's shape (lib/admin/content/collections.ts) -- the same established pattern for a destructive, confirmed content delete. */
export async function deleteTranscript(episodeId: string): Promise<{ episodeSlug: string }> {
  const episode = await prisma.episode.findUnique({ where: { id: episodeId }, select: { slug: true } });
  if (!episode) throw new AdminContentError("لم يتم العثور على هذه الحلقة.");

  const existing = await prisma.transcript.findFirst({ where: { episodeId }, select: { id: true } });
  if (!existing) throw new AdminContentError("لا يوجد نص لحذفه لهذه الحلقة.");

  await prisma.transcript.delete({ where: { id: existing.id } });
  return { episodeSlug: episode.slug };
}
