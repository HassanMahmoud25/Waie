export type TranscriptSegment = {
  id: string;
  startSeconds: number;
  endSeconds?: number;
  speaker?: string;
  text: string;
};

export type Transcript = {
  id: string;
  episodeId: string;
  language: string;
  segments: TranscriptSegment[];
};
