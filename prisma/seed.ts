/**
 * Deliberately minimal. This project's real content comes from the YouTube
 * sync system (lib/sync + /admin/sync/youtube), not from a hand-typed seed
 * file pretending to represent the channel -- see the data-ownership rules
 * in prisma/schema.prisma. `db:seed` only registers the channel handle so
 * the first sync run has less to resolve; it creates zero episodes/series.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const handle = process.env.YOUTUBE_CHANNEL_HANDLE?.trim() || "@Waie";

async function main() {
  const existing = await prisma.youTubeChannel.findUnique({ where: { handle } });
  if (existing) {
    console.log(`YouTubeChannel "${handle}" already registered -- nothing to seed.`);
    return;
  }
  console.log(
    `No YouTubeChannel row for "${handle}" yet -- it will be created automatically the first time you run a sync from /admin/sync/youtube.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
