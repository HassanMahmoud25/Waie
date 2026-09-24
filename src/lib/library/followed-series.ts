import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/server";

/**
 * The signed-in user's followed series ids, straight from the database --
 * never another user's. The user id always comes from the server session
 * (getSessionUser), never a caller-supplied id. Anonymous visitors get an
 * empty list. Mirrors lib/library/saved-episodes.ts exactly.
 *
 * Plain server-side helper, not a Server Action -- only ever called from
 * Server Components (see (site)/layout.tsx), never invoked as an RPC from a
 * Client Component the way lib/library/actions.ts's mutations are.
 */
export async function getFollowedSeriesIds(): Promise<string[]> {
  const user = await getSessionUser();
  if (!user) return [];

  const rows = await prisma.followedSeries.findMany({
    where: { userId: user.id },
    select: { seriesId: true },
  });
  return rows.map((row) => row.seriesId);
}
