import { z } from "zod";

/**
 * Validation for the admin collection CMS actions in
 * lib/admin/content/collection-actions.ts (Phase 3D). Mirrors
 * lib/validation/admin-series.ts's shape. `coverImage` and `kind` are
 * deliberately absent -- both exist on the Collection model but neither is
 * read anywhere in the public site (see lib/admin/content/collections.ts's
 * file comment), so exposing them here would be a dead control.
 */

export const createCollectionSchema = z.object({
  title: z.string().trim().min(2, "العنوان قصير جدًا.").max(160, "العنوان طويل جدًا."),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;

/**
 * Every field optional -- callers send only what changed. `status` is
 * deliberately absent: publishing/unpublishing are their own actions (see
 * publishCollectionAction/unpublishCollectionAction). `slug` is absent too --
 * generated once at creation and never hand-edited (see
 * lib/admin/content/collections.ts).
 */
export const updateCollectionSchema = z.object({
  title: z.string().trim().min(2, "العنوان قصير جدًا.").max(160, "العنوان طويل جدًا.").optional(),
  description: z.string().trim().max(2000, "الوصف طويل جدًا.").optional(),
  seoTitle: z.string().trim().max(160, "عنوان SEO طويل جدًا.").nullable().optional(),
  seoDescription: z.string().trim().max(300, "وصف SEO طويل جدًا.").nullable().optional(),
});

export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;

/** A bare episode/collection id -- used to validate the add/remove/move episode-assignment actions' arguments. */
export const idField = z.string().trim().min(1, "معرّف غير صحيح.");
