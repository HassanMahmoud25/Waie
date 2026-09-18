import { importFullChannel } from "./import-full-channel";
import { syncNewVideos } from "./sync-new-videos";
import { syncMetadata } from "./sync-metadata";
import { syncPlaylists } from "./sync-playlists";
import { runSync } from "./run-sync";

export type { SyncResult, SyncErrorEntry } from "./types";

/** The four operations the admin sync UI exposes -- each recorded as a SyncRun. */
export const runImportFullChannel = () => runSync("FULL_IMPORT", importFullChannel);
export const runSyncNewVideos = () => runSync("NEW_VIDEOS", syncNewVideos);
export const runSyncMetadata = () => runSync("METADATA", syncMetadata);
export const runSyncPlaylists = () => runSync("PLAYLISTS", syncPlaylists);
