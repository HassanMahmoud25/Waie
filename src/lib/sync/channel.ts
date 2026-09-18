import { prisma } from "@/lib/db/prisma";
import { resolveChannelByHandle } from "@/lib/youtube/service";

const CHANNEL_HANDLE = process.env.YOUTUBE_CHANNEL_HANDLE?.trim() || "@Waie";

export { CHANNEL_HANDLE };

/** Returns the cached channel row, resolving + caching it via the API the first time it's needed. */
export async function getOrResolveChannel() {
  const existing = await prisma.youTubeChannel.findUnique({ where: { handle: CHANNEL_HANDLE } });
  if (existing) return existing;

  const resolved = await resolveChannelByHandle(CHANNEL_HANDLE);
  return prisma.youTubeChannel.create({
    data: {
      handle: CHANNEL_HANDLE,
      channelId: resolved.channelId,
      uploadsPlaylistId: resolved.uploadsPlaylistId,
    },
  });
}
