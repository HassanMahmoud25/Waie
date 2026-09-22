import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/server";

/**
 * The signed-in user's saved episode ids, straight from the database --
 * never another user's. The user id always comes from the server session
 * (getSessionUser), never a caller-supplied id, so there is no way to ask
 * for anyone else's list. Anonymous visitors get an empty list.
 *
 * Plain server-side helper, not a Server Action -- it's only ever called
 * from Server Components (see (site)/layout.tsx), never invoked as an RPC
 * from a Client Component the way lib/library/actions.ts's mutation is.
 */
export async function getSavedEpisodeIds(): Promise<string[]> {
  const user = await getSessionUser();
  if (!user) return [];

  const rows = await prisma.savedEpisode.findMany({
    where: { userId: user.id },
    select: { episodeId: true },
  });
  return rows.map((row) => row.episodeId);
}
