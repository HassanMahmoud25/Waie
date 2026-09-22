import { z } from "zod";

/**
 * Validation for the admin topic CMS actions in
 * lib/admin/content/topic-actions.ts (Phase 3C). Topics have no status field
 * (see prisma/schema.prisma) -- this stays a plain taxonomy editor, never a
 * mini publish workflow. Mirrors lib/validation/admin-series.ts's shape.
 */

export const createTopicSchema = z.object({
  title: z.string().trim().min(2, "العنوان قصير جدًا.").max(80, "العنوان طويل جدًا."),
});

export type CreateTopicInput = z.infer<typeof createTopicSchema>;

/** A hex color (#22c55e, #2c5) or a CSS variable reference (var(--accent)) -- the two forms the topic chip/dot already renders (see components consuming Topic.color). */
const colorField = z
  .string()
  .trim()
  .max(40, "قيمة اللون طويلة جدًا.")
  .transform((value) => (value === "" ? null : value))
  .refine((value) => value === null || /^#[0-9a-fA-F]{3,8}$/.test(value) || /^var\(--[\w-]+\)$/.test(value), {
    message: "استخدم لونًا سداسيًا مثل #22c55e أو متغيّر تصميم مثل var(--accent).",
  });

/**
 * Every field optional -- callers send only what changed. `slug` is absent --
 * generated once at creation and never hand-edited (see
 * lib/admin/content/topics.ts).
 */
export const updateTopicSchema = z.object({
  title: z.string().trim().min(2, "العنوان قصير جدًا.").max(80, "العنوان طويل جدًا.").optional(),
  description: z.string().trim().max(600, "الوصف طويل جدًا.").optional(),
  color: colorField.optional(),
  seoTitle: z.string().trim().max(160, "عنوان SEO طويل جدًا.").nullable().optional(),
  seoDescription: z.string().trim().max(300, "وصف SEO طويل جدًا.").nullable().optional(),
});

export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;
