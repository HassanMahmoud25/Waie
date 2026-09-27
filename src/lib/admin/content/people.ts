import { prisma } from "@/lib/db/prisma";
import { AdminContentError } from "@/lib/admin/content/errors";
import type { CreatePersonInput, UpdatePersonInput } from "@/lib/validation/admin-person";

export { AdminContentError } from "@/lib/admin/content/errors";

/**
 * Admin-only, server-only data access for the People CMS -- the canonical
 * Person records episode participants are picked from (see
 * EpisodeParticipant in prisma/schema.prisma). Mirrors lib/admin/content/
 * topics.ts's shape (a plain, status-less taxonomy-style editor): talks to
 * Prisma directly, deliberately separate from src/lib/repositories.
 *
 * Deliberately unrelated to the static Hosts system (src/data/hosts.ts) --
 * this never reads or writes that file, and nothing here feeds the public
 * Hosts page.
 */

const withEpisodeCount = { include: { _count: { select: { episodeParticipants: true } } } } as const;

/** Every person, for the admin list and the episode editor's participant picker. */
export async function listPeopleForAdmin() {
  return prisma.person.findMany({ ...withEpisodeCount, orderBy: { createdAt: "desc" } });
}

export async function getPersonForAdmin(id: string) {
  return prisma.person.findUnique({ where: { id }, ...withEpisodeCount });
}

export async function createPerson(input: CreatePersonInput) {
  return prisma.person.create({ data: { name: input.name, imageUrl: input.imageUrl ?? null }, ...withEpisodeCount });
}

/**
 * The episode/series slugs that need revalidating because they show this
 * person -- read *before* the caller writes anything, so update/delete
 * actions know exactly which public pages just went stale (see
 * lib/admin/content/actions.ts's revalidatePublicEpisodePaths, reused by
 * person-actions.ts for this same purpose).
 */
async function getAffectedEpisodePaths(personId: string): Promise<{ slug: string; seriesSlug: string | null }[]> {
  const rows = await prisma.episodeParticipant.findMany({
    where: { personId },
    select: { episode: { select: { slug: true, series: { select: { slug: true } } } } },
  });
  return rows.map((row) => ({ slug: row.episode.slug, seriesSlug: row.episode.series?.slug ?? null }));
}

/**
 * Updates a person's editorial fields and returns which public episode pages
 * now show stale data as a result -- every episode this person is tagged on,
 * since their name/image is read live off this one canonical row wherever
 * they appear (never copied onto Episode/EpisodeParticipant).
 */
export async function updatePerson(id: string, patch: UpdatePersonInput) {
  const existing = await prisma.person.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new AdminContentError("لم يتم العثور على هذا الشخص.");

  const affectedEpisodes = await getAffectedEpisodePaths(id);
  const person = await prisma.person.update({ where: { id }, data: patch, ...withEpisodeCount });
  return { person, affectedEpisodes };
}

/**
 * Deletes a person. Unlike deleteTopic, this never refuses because the
 * person is still in use -- EpisodeParticipant.personId -> Person cascades
 * (ON DELETE CASCADE, see prisma/migrations/*_add_episode_participants), so
 * deleting a person is exactly "remove them from every episode they were
 * tagged on", not an error condition. The confirmation UI (people-editor.tsx)
 * is what makes that consequence explicit to the admin before they click --
 * this function still returns the affected episodes so the action layer can
 * revalidate those now-stale public pages.
 */
export async function deletePerson(id: string): Promise<{ affectedEpisodes: { slug: string; seriesSlug: string | null }[] }> {
  const existing = await prisma.person.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new AdminContentError("لم يتم العثور على هذا الشخص.");

  const affectedEpisodes = await getAffectedEpisodePaths(id);
  await prisma.person.delete({ where: { id } });
  return { affectedEpisodes };
}
