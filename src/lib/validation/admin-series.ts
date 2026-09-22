import { z } from "zod";

/**
 * Validation for the admin series CMS actions in
 * lib/admin/content/series-actions.ts (Phase 3C). Follows the same shape as
 * lib/validation/admin-episode.ts: a narrow create schema (just enough to
 * make a DRAFT row) and a richer, fully-optional update schema for the
 * editor's Save action.
 */

export const createSeriesSchema = z.object({
  title: z.string().trim().min(2, "العنوان قصير جدًا.").max(160, "العنوان طويل جدًا."),
});

export type CreateSeriesInput = z.infer<typeof createSeriesSchema>;

/** Empty clears the field; otherwise an http(s):// URL or a same-origin /path. Unlike Episode.audioUrl this has no host restriction -- any image host is fine for a cover image. */
const imageUrlField = z
  .string()
  .trim()
  .max(500, "الرابط طويل جدًا.")
  .transform((value) => (value === "" ? null : value))
  .refine((value) => value === null || value.startsWith("/") || /^https?:\/\//i.test(value), {
    message: "الرابط يجب أن يبدأ بـ http(s):// أو يكون مسارًا داخليًا يبدأ بـ /.",
  });

/**
 * Every field optional -- callers send only what changed. `status` is
 * deliberately absent: publishing/unpublishing are their own actions (see
 * publishSeriesAction/unpublishSeriesAction), kept separate so a generic
 * content edit can never accidentally flip publication state. `slug` is
 * absent too -- generated once at creation and never hand-edited (see
 * lib/admin/content/series.ts).
 */
export const updateSeriesContentSchema = z.object({
  title: z.string().trim().min(2, "العنوان قصير جدًا.").max(160, "العنوان طويل جدًا.").optional(),
  description: z.string().trim().max(2000, "الوصف طويل جدًا.").optional(),
  topicId: z.string().trim().min(1).nullable().optional(),
  coverImage: imageUrlField.optional(),
  coverImageMobile: imageUrlField.optional(),
  seoTitle: z.string().trim().max(160, "عنوان SEO طويل جدًا.").nullable().optional(),
  seoDescription: z.string().trim().max(300, "وصف SEO طويل جدًا.").nullable().optional(),
});

export type UpdateSeriesContentInput = z.infer<typeof updateSeriesContentSchema>;
