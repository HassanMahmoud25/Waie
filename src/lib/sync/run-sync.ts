import { prisma } from "@/lib/db/prisma";
import type { SyncType } from "@prisma/client";
import { describeError, type SyncResult } from "./types";

/**
 * Wraps a sync operation with a SyncRun row so /admin/sync/youtube has a
 * real, persisted history -- not just the result of the last click. A run
 * is FAILED only when it produced nothing at all; a run that made partial
 * progress despite some per-video errors is SUCCEEDED with errors attached,
 * since "one video failed" must never look like "the import failed."
 */
export async function runSync(type: SyncType, operation: () => Promise<SyncResult>): Promise<SyncResult> {
  const run = await prisma.syncRun.create({ data: { type, status: "RUNNING" } });

  try {
    const result = await operation();
    const madeProgress =
      result.videosCreated > 0 || result.videosUpdated > 0 || result.seriesCreated > 0 || result.videosSkipped > 0;
    const status = !madeProgress && result.errors.length > 0 ? "FAILED" : "SUCCEEDED";

    await prisma.syncRun.update({
      where: { id: run.id },
      data: {
        status,
        videosDiscovered: result.videosDiscovered,
        videosCreated: result.videosCreated,
        videosUpdated: result.videosUpdated,
        videosSkipped: result.videosSkipped,
        playlistsDiscovered: result.playlistsDiscovered,
        seriesCreated: result.seriesCreated,
        errors: result.errors.length > 0 ? result.errors : undefined,
        finishedAt: new Date(),
      },
    });

    return result;
  } catch (error) {
    await prisma.syncRun.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        errors: [{ message: describeError(error) }],
        finishedAt: new Date(),
      },
    });
    throw error;
  }
}
