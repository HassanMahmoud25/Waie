/**
 * A transcript is one complete text body per episode/language (Phase 5H) --
 * not a collection of timestamped segments. Chapter/section structure with
 * timestamps lives in MindMap instead.
 */
export type Transcript = {
  id: string;
  episodeId: string;
  language: string;
  text: string;
};
