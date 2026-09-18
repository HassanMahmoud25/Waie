import type { Transcript } from "@/types/transcript";

/**
 * Full timestamped transcripts require either YouTube's caption track (a
 * separate, much larger extraction than channel/video metadata) or manual
 * transcription — out of scope for a metadata import. Left empty; the
 * "النص الكامل" tab's empty state covers this until real transcripts are
 * added.
 */
export const transcripts: Transcript[] = [];
