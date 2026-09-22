import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/server";

/** Mirrors hooks/use-library.ts's ProgressEntry shape so the DB and localStorage paths are interchangeable to callers. */
export type WatchProgressEntry = {
  seconds: number;
  durationSeconds: number;
  completed: boolean;
  updatedAt: number;
};

/**
 * The signed-in user's watch progress, keyed by episodeId -- never another
 * user's. The user id always comes from the server session
 * (getSessionUser), never a caller-supplied id. Anonymous visitors get an
 * empty record (their progress, if any, stays in localStorage -- see
 * hooks/use-library.ts).
 *
 * Plain server-side helper, not a Server Action -- only ever called from
 * Server Components (see (site)/layout.tsx). Never import this from
 * client-facing code (hooks/use-library.ts, the progress store/provider) --
 * it pulls in Prisma, which must not reach the client bundle. Those files
 * import only the `WatchProgressEntry` type from here (erased at compile
 * time) or the actions in lib/library/actions.ts instead.
 */
export async function getWatchProgress(): Promise<Record<string, WatchProgressEntry>> {
  const user = await getSessionUser();
  if (!user) return {};

  const rows = await prisma.watchProgress.findMany({ where: { userId: user.id } });

  const byEpisodeId: Record<string, WatchProgressEntry> = {};
  for (const row of rows) {
    byEpisodeId[row.episodeId] = {
      seconds: row.seconds,
      durationSeconds: row.duration,
      completed: row.completed,
      updatedAt: row.updatedAt.getTime(),
    };
  }
  return byEpisodeId;
}
