import { z } from "zod";

/**
 * Validates the admin episode-edit form at the server-action boundary.
 * Kept narrow on purpose: only the fields the in-memory demo editor exposes
 * today (title/description/status) — extend alongside the editor, not ahead of it.
 */
export const episodeEditSchema = z.object({
  title: z.string().trim().min(3, "العنوان قصير جدًا.").max(160, "العنوان طويل جدًا."),
  description: z.string().trim().min(10, "الوصف قصير جدًا.").max(600, "الوصف طويل جدًا."),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"], { message: "اختر حالة صحيحة." }),
});

export type EpisodeEditInput = z.infer<typeof episodeEditSchema>;
