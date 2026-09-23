import { prisma } from "@/lib/db/prisma";
import { AdminContentError } from "@/lib/admin/content/errors";

export { AdminContentError } from "@/lib/admin/content/errors";

/**
 * Admin-only, server-only data access for the Transcript editor (Phase 5E,
 * simplified to a single text body in Phase 5H). Talks to Prisma directly --
 * deliberately separate from src/lib/repositories (the public-facing
 * ContentRepository, whose toTranscript() keeps reading from this exact same
 * Transcript table unchanged).
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

/**
 * Creates or updates the one transcript for an episode. `language` is never
 * touched on an update (preserved exactly as it already is); a brand-new
 * transcript is created with the schema's own default ("ar") -- the only
 * language any content in this app has ever used.
 */
export async function saveTranscript(episodeId: string, text: string) {
  const episode = await prisma.episode.findUnique({ where: { id: episodeId }, select: { slug: true } });
  if (!episode) throw new AdminContentError("لم يتم العثور على هذه الحلقة.");

  const existing = await prisma.transcript.findFirst({ where: { episodeId }, select: { id: true } });

  if (existing) {
    await prisma.transcript.update({ where: { id: existing.id }, data: { text } });
  } else {
    await prisma.transcript.create({ data: { episodeId, language: "ar", text } });
  }

  return { episodeSlug: episode.slug };
}

/** Deletes the episode's transcript entirely. Mirrors deleteMindMap's shape (lib/admin/content/mind-maps.ts) -- the same established pattern for a destructive, confirmed content delete. */
export async function deleteTranscript(episodeId: string): Promise<{ episodeSlug: string }> {
  const episode = await prisma.episode.findUnique({ where: { id: episodeId }, select: { slug: true } });
  if (!episode) throw new AdminContentError("لم يتم العثور على هذه الحلقة.");

  const existing = await prisma.transcript.findFirst({ where: { episodeId }, select: { id: true } });
  if (!existing) throw new AdminContentError("لا يوجد نص لحذفه لهذه الحلقة.");

  await prisma.transcript.delete({ where: { id: existing.id } });
  return { episodeSlug: episode.slug };
}
