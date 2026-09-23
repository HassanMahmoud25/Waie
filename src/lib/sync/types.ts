export type SyncErrorEntry = { videoId?: string; playlistId?: string; message: string };

export type SyncResult = {
  videosDiscovered: number;
  videosCreated: number;
  videosUpdated: number;
  videosSkipped: number;
  /** Classified SHORT and written to the separate Short table -- never counted in videosCreated/videosUpdated. */
  shortsCreated: number;
  shortsUpdated: number;
  /** Classification was inconclusive (see classify-video.ts) -- never became an Episode or a Short. */
  videosUnknown: number;
  /** The actual video ids behind videosUnknown, so an admin can look them up -- not persisted to SyncRun, only shown for the run that just finished. */
  unknownVideoIds: string[];
  playlistsDiscovered: number;
  seriesCreated: number;
  errors: SyncErrorEntry[];
  durationMs: number;
};

export function emptyResult(): SyncResult {
  return {
    videosDiscovered: 0,
    videosCreated: 0,
    videosUpdated: 0,
    videosSkipped: 0,
    shortsCreated: 0,
    shortsUpdated: 0,
    videosUnknown: 0,
    unknownVideoIds: [],
    playlistsDiscovered: 0,
    seriesCreated: 0,
    errors: [],
    durationMs: 0,
  };
}

export function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
