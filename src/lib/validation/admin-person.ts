import { z } from "zod";

/**
 * Validation for the admin People CMS (Person create/update) -- mirrors
 * lib/validation/admin-topic.ts's shape (a plain, status-less taxonomy-style
 * editor).
 */

/**
 * Empty clears the field; otherwise an https:// URL or a same-origin /path --
 * the same dual form audioUrlField (lib/validation/episode.ts) accepts, since
 * a Person's photo is just as likely to be a locally committed asset (e.g.
 * public/people/*.jpg, mirroring the existing public/hosts/*.jpg convention)
 * as an external URL. Unlike audioUrlField there's no host to exclude here.
 */
const personImageUrlField = z
  .string()
  .trim()
  .max(500, "رابط الصورة طويل جدًا.")
  .transform((value) => (value === "" ? null : value))
  .refine((value) => value === null || value.startsWith("/") || /^https:\/\//i.test(value), {
    message: "رابط الصورة يجب أن يبدأ بـ https:// أو يكون مسارًا داخليًا يبدأ بـ /.",
  });

export const createPersonSchema = z.object({
  name: z.string().trim().min(2, "الاسم قصير جدًا.").max(80, "الاسم طويل جدًا."),
  imageUrl: personImageUrlField.optional(),
});

export type CreatePersonInput = z.infer<typeof createPersonSchema>;

/** Every field optional -- callers send only what changed. */
export const updatePersonSchema = z.object({
  name: z.string().trim().min(2, "الاسم قصير جدًا.").max(80, "الاسم طويل جدًا.").optional(),
  imageUrl: personImageUrlField.nullable().optional(),
});

export type UpdatePersonInput = z.infer<typeof updatePersonSchema>;
