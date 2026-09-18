/** Shaped after the Prisma `Note` model (see prisma/schema.prisma) so a real backend can later replace hooks/use-notes.ts's internals without touching the components that read `EpisodeNote` values. */
export type EpisodeNote = {
  id: string;
  userId: string;
  episodeId: string;
  /** Playback position the note is anchored to, in seconds. */
  seconds: number;
  text: string;
  /** ISO 8601 timestamps -- serializable to/from localStorage and a future API alike. */
  createdAt: string;
  updatedAt: string;
};
