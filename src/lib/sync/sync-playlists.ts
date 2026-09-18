import { prisma } from "@/lib/db/prisma";
import { getOrResolveChannel } from "./channel";
import { discoverAndSyncPlaylists } from "./playlists";
import { describeError, emptyResult, type SyncResult } from "./types";

/** Re-discovers playlists: new playlists become new Series, and any not-yet-assigned episode gets slotted in. */
export async function syncPlaylists(): Promise<SyncResult> {
  const startedAt = Date.now();
  const result = emptyResult();

  try {
    const channel = await getOrResolveChannel();
    const outcome = await discoverAndSyncPlaylists(channel.channelId);
    result.playlistsDiscovered = outcome.playlistsDiscovered;
    result.seriesCreated = outcome.seriesCreated;
    result.errors.push(...outcome.errors);

    await prisma.youTubeChannel.update({
      where: { id: channel.id },
      data: { lastPlaylistSyncAt: new Date() },
    });
  } catch (error) {
    result.errors.push({ message: describeError(error) });
  }

  result.durationMs = Date.now() - startedAt;
  return result;
}
