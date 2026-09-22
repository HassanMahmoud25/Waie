import { z } from "zod";
import { audioUrlField } from "./episode";

/**
 * CMS foundation (Phase 3A) validation for the new admin episode actions in
 * lib/admin/content/actions.ts. Deliberately separate from
 * lib/validation/episode.ts's `episodeEditSchema`, which stays exactly as-is
 * for the existing narrow edit form (title/description/status/audioUrl) --
 * this schema covers the richer field set the new create/update actions
 * support, reusing `audioUrlField` rather than duplicating it.
 */

/** Accepts a full YouTube URL or a bare video id -- lib/youtube/service.ts's parseYouTubeId() extracts the id either way. */
export const createEpisodeSchema = z.object({
  youtubeUrlOrId: z.string().trim().min(1, "أدخل رابط يوتيوب أو معرّف الفيديو."),
});

export type CreateEpisodeInput = z.infer<typeof createEpisodeSchema>;

/**
 * Every field optional: callers send only what changed (a real PATCH), and
 * the admin content layer only touches columns that are present in the
 * parsed result. `status` is deliberately NOT here -- publishing/unpublishing
 * are their own actions (see publishEpisodeAction/unpublishEpisodeAction),
 * kept separate so a general content edit can never accidentally flip
 * publication state.
 */
export const updateEpisodeContentSchema = z.object({
  title: z.string().trim().min(3, "العنوان قصير جدًا.").max(160, "العنوان طويل جدًا.").optional(),
  description: z.string().trim().max(5000, "الوصف طويل جدًا.").optional(),
  seriesId: z.string().trim().min(1).nullable().optional(),
  topicIds: z.array(z.string().trim().min(1)).optional(),
  episodeNumber: z.coerce.number().int().positive().nullable().optional(),
  featured: z.boolean().optional(),
  audioUrl: audioUrlField.optional(),
  seoTitle: z.string().trim().max(160, "عنوان SEO طويل جدًا.").nullable().optional(),
  seoDescription: z.string().trim().max(300, "وصف SEO طويل جدًا.").nullable().optional(),
});

export type UpdateEpisodeContentInput = z.infer<typeof updateEpisodeContentSchema>;
