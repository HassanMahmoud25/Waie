import { z } from "zod";

/**
 * Validation for the admin Transcript editor (Phase 5H) -- a transcript is
 * one complete plain-text body, not a collection of timestamped segments.
 * Saving an empty body is rejected; clearing a transcript entirely goes
 * through the dedicated delete action instead (see transcript-actions.ts),
 * mirroring how every other admin content delete in this project is its own
 * explicit, confirmed action rather than "save with nothing in it".
 */
export const saveTranscriptSchema = z.object({
  text: z.string().trim().min(1, "لا يمكن حفظ نص فارغ."),
});

export type SaveTranscriptInput = z.infer<typeof saveTranscriptSchema>;
