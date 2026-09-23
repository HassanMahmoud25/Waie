import { z } from "zod";

/**
 * Validation for the admin Transcript editor (Phase 5E) -- one Server Action
 * (saveTranscriptAction, see lib/admin/content/transcript-actions.ts) saves
 * the whole segment list at once, since Transcript.segments is a single Json
 * column rather than separate relational rows. Mirrors the existing
 * TranscriptSegment shape (src/types/transcript.ts) exactly: id,
 * startSeconds (required), endSeconds (optional), speaker (optional), text
 * (required).
 */

const transcriptSegmentSchema = z
  .object({
    id: z.string().trim().min(1, "معرّف المقطع مفقود."),
    startSeconds: z.coerce.number().min(0, "توقيت البداية يجب ألا يكون سالبًا."),
    endSeconds: z.coerce.number().min(0, "توقيت النهاية يجب ألا يكون سالبًا.").nullable().optional(),
    speaker: z.string().trim().max(80, "اسم المتحدث طويل جدًا.").nullable().optional(),
    text: z.string().trim().min(1, "نص المقطع لا يمكن أن يكون فارغًا."),
  })
  .refine((segment) => segment.endSeconds == null || segment.endSeconds >= segment.startSeconds, {
    message: "توقيت النهاية يجب أن يكون بعد توقيت البداية أو مساويًا له.",
    path: ["endSeconds"],
  });

/**
 * The full transcript as an ordered array. Array order IS the persisted
 * segment order -- segments are one JSON blob, not separate rows with their
 * own `order` column -- so "deterministic ordering" just means this array is
 * written back exactly as given, never re-sorted by the server.
 */
export const transcriptSegmentsSchema = z
  .array(transcriptSegmentSchema)
  .refine((segments) => new Set(segments.map((segment) => segment.id)).size === segments.length, {
    message: "لا يمكن أن يحمل مقطعان نفس المعرّف.",
  });

export type TranscriptSegmentInput = z.infer<typeof transcriptSegmentsSchema>[number];
