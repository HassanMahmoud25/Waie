import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/server";
import type { EpisodeNote } from "@/types/note";

/** Maps a Prisma `Note` row to the app's EpisodeNote shape (`body` -> `text`, Dates -> ISO strings). Shared with lib/library/actions.ts so both sides of the read/write split agree on the mapping. */
export function toEpisodeNote(row: {
  id: string;
  userId: string;
  episodeId: string;
  seconds: number;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}): EpisodeNote {
  return {
    id: row.id,
    userId: row.userId,
    episodeId: row.episodeId,
    seconds: row.seconds,
    text: row.body,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/**
 * Every note the signed-in user has written, across all episodes -- never
 * another user's. The user id always comes from the server session
 * (getSessionUser), never a caller-supplied id. Anonymous visitors get an
 * empty list (their notes, if any, stay in localStorage -- see
 * hooks/use-notes.ts).
 *
 * Fetched once per page load at the site layout (see (site)/layout.tsx),
 * not once per episode -- hooks/use-notes.ts filters this down to one
 * episode's notes client-side, the same way the pre-existing localStorage
 * implementation already did.
 *
 * Plain server-side helper, not a Server Action -- only ever called from
 * Server Components. Never import this from client-facing code; those
 * files import only the `EpisodeNote` type (erased at compile time) or the
 * actions in lib/library/actions.ts instead.
 */
export async function getUserNotes(): Promise<EpisodeNote[]> {
  const user = await getSessionUser();
  if (!user) return [];

  const rows = await prisma.note.findMany({ where: { userId: user.id }, orderBy: { seconds: "asc" } });
  return rows.map(toEpisodeNote);
}
