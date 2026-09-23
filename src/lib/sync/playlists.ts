import { prisma } from "@/lib/db/prisma";
import { listAllChannelPlaylists, listAllPlaylistItems } from "@/lib/youtube/service";
import { uniqueSeriesSlug } from "./slug";
import { describeError, type SyncErrorEntry } from "./types";

export type PlaylistSyncOutcome = {
  playlistsDiscovered: number;
  seriesCreated: number;
  errors: SyncErrorEntry[];
};

/**
 * Discovers every playlist on the channel, upserts a discovery-only
 * Playlist row for each, creates a Series the first time a playlist is
 * seen (never again -- `sourcePlaylistId` is unique), and assigns episodes
 * to that series ONLY while they have no series yet.
 *
 * That last rule is what keeps this safe to re-run: once an episode has a
 * seriesId -- whether set here on first sync or hand-edited by an admin --
 * this never touches it again, so moving an episode between series in the
 * CMS, or re-ordering it, survives every future "Sync Playlists" run.
 *
 * A newly-discovered playlist's Series always starts DRAFT (Phase 5B fix):
 * this function used to publish it immediately, which is exactly how the
 * channel's "Clips" and master "بودكاست وعي" playlists became public Series
 * with zero editorial review the first time sync ever ran. Any YouTube
 * playlist the channel owner creates -- intentional topical series or not --
 * is discoverable here, so nothing should go live without a human looking
 * at it first, via the same admin Series CMS (Phase 3C) that already gates
 * every other new Series. This never touches the two existing non-canonical
 * Series (Clips, بودكاست وعي) -- the `if (!series)` guard below only ever
 * fires for a playlist that doesn't have a Series row yet.
 */
export async function discoverAndSyncPlaylists(channelId: string): Promise<PlaylistSyncOutcome> {
  const outcome: PlaylistSyncOutcome = { playlistsDiscovered: 0, seriesCreated: 0, errors: [] };

  const playlists = await listAllChannelPlaylists(channelId);
  outcome.playlistsDiscovered = playlists.length;

  for (const playlist of playlists) {
    try {
      await prisma.playlist.upsert({
        where: { youtubePlaylistId: playlist.playlistId },
        update: { title: playlist.title, description: playlist.description, itemCount: playlist.itemCount },
        create: {
          youtubePlaylistId: playlist.playlistId,
          title: playlist.title,
          description: playlist.description,
          itemCount: playlist.itemCount,
        },
      });

      let series = await prisma.series.findUnique({ where: { sourcePlaylistId: playlist.playlistId } });
      if (!series) {
        const slug = await uniqueSeriesSlug(
          playlist.title
            .normalize("NFKD")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "") || `series-${playlist.playlistId.slice(-8).toLowerCase()}`,
        );
        series = await prisma.series.create({
          data: {
            title: playlist.title,
            slug,
            description: playlist.description,
            sourcePlaylistId: playlist.playlistId,
            status: "DRAFT",
          },
        });
        outcome.seriesCreated += 1;
      }

      const items = await listAllPlaylistItems(playlist.playlistId);
      for (const item of items) {
        try {
          await prisma.episode.updateMany({
            where: { youtubeVideoId: item.videoId, seriesId: null },
            data: { seriesId: series.id, seriesOrder: item.position },
          });
        } catch (error) {
          outcome.errors.push({ videoId: item.videoId, message: describeError(error) });
        }
      }
    } catch (error) {
      outcome.errors.push({ playlistId: playlist.playlistId, message: describeError(error) });
    }
  }

  return outcome;
}
