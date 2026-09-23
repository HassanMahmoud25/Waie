import { z } from "zod";
import { RecommendationType } from "@prisma/client";

/**
 * Validation for the admin Recommendations editor (Phase 5I). A
 * Recommendation is a real relational row per item (not one Json blob like
 * Transcript/MindMap), but the editor still behaves like "one Save action
 * persists the whole list" -- see lib/admin/content/recommendations.ts for
 * how the submitted list is reconciled against the episode's existing rows.
 */

/**
 * The types the admin "add new" control offers -- the 8 the public
 * renderer's own typeMeta (recommendations-panel.tsx) actively designs a
 * label/icon/CTA for today. MOVIE/PERSON/PRODUCT/STUDY/REFERENCE stay in the
 * Prisma enum (pre-redesign legacy values -- see schema.prisma's own
 * comment) purely so an old row of that type would still load and stay
 * editable; they are never offered for a brand-new recommendation.
 */
export const CREATABLE_RECOMMENDATION_TYPES: readonly RecommendationType[] = [
  RecommendationType.YOUTUBE,
  RecommendationType.SOUNDCLOUD,
  RecommendationType.PODCAST,
  RecommendationType.BOOK,
  RecommendationType.WEBSITE,
  RecommendationType.EXTERNAL,
  RecommendationType.FACEBOOK,
  RecommendationType.INSTAGRAM,
];

/**
 * Empty clears the field; otherwise must be a well-formed https:// URL.
 * Recommendations legitimately link to any external platform (including
 * YouTube), unlike audioUrlField in lib/validation/episode.ts which
 * deliberately excludes YouTube -- so this is its own, more permissive field
 * rather than a reuse of that one.
 */
const externalUrlField = z
  .string()
  .trim()
  .max(500, "الرابط طويل جدًا.")
  .optional()
  .transform((value) => (value === "" || value === undefined ? undefined : value))
  .refine((value) => value === undefined || /^https:\/\//i.test(value), {
    message: "الرابط يجب أن يبدأ بـ https://.",
  })
  .refine(
    (value) => {
      if (value === undefined) return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    { message: "الرابط غير صالح." },
  );

/**
 * Every field below is genuinely supported for every RecommendationType --
 * RecommendationCard (recommendations-panel.tsx) renders title/description/
 * reason/url/imageUrl/timestampSeconds identically regardless of type, only
 * varying the icon/label/CTA text. There is no type-specific field
 * restriction in the current renderer to encode here.
 */
const recommendationItemSchema = z.object({
  id: z.string().trim().min(1, "معرّف التوصية مفقود."),
  type: z.nativeEnum(RecommendationType, { errorMap: () => ({ message: "نوع التوصية غير صالح." }) }),
  title: z.string().trim().min(1, "عنوان التوصية لا يمكن أن يكون فارغًا.").max(200, "العنوان طويل جدًا."),
  description: z.string().trim().min(1, "الوصف لا يمكن أن يكون فارغًا.").max(1000, "الوصف طويل جدًا.").optional(),
  reason: z.string().trim().min(1, "السبب لا يمكن أن يكون فارغًا.").max(500, "السبب طويل جدًا.").optional(),
  imageUrl: externalUrlField,
  url: externalUrlField,
  timestampSeconds: z
    .number()
    .finite("قيمة التوقيت غير صالحة.")
    .min(0, "التوقيت يجب ألا يكون سالبًا.")
    .optional(),
});

/** The whole list, submitted and validated together on every Save. */
export const saveRecommendationsSchema = z
  .array(recommendationItemSchema)
  .refine((items) => new Set(items.map((item) => item.id)).size === items.length, {
    message: "لا يمكن أن تحمل توصيتان نفس المعرّف.",
  });

export type RecommendationItemInput = z.infer<typeof saveRecommendationsSchema>[number];
