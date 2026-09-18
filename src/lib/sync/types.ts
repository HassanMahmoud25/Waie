export type SyncErrorEntry = { videoId?: string; playlistId?: string; message: string };

export type SyncResult = {
  videosDiscovered: number;
  videosCreated: number;
  videosUpdated: number;
  videosSkipped: number;
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
    playlistsDiscovered: 0,
    seriesCreated: 0,
    errors: [],
    durationMs: 0,
  };
}

export function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
