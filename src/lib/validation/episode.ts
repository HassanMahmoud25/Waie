import { z } from "zod";

/** Hosts that only ever serve YouTube's own media: an audio file must be one Waie owns, never lifted from YouTube. */
const YOUTUBE_HOSTS = /(^|\.)(youtube\.com|youtube-nocookie\.com|youtu\.be|googlevideo\.com|ytimg\.com)$/i;

/** Empty clears the field; otherwise an https:// URL (Waie's CDN/podcast host) or a same-origin /path, and never a YouTube host. */
const audioUrlField = z
  .string()
  .trim()
  .max(500, "رابط الصوت طويل جدًا.")
  .transform((value) => (value === "" ? null : value))
  .refine((value) => value === null || value.startsWith("/") || /^https:\/\//i.test(value), {
    message: "رابط الصوت يجب أن يبدأ بـ https:// أو يكون مسارًا داخليًا يبدأ بـ /.",
  })
  .refine(
    (value) => {
      if (value === null || value.startsWith("/")) return true;
      try {
        return !YOUTUBE_HOSTS.test(new URL(value).hostname);
      } catch {
        return false;
      }
    },
    { message: "لا يُقبل رابط من يوتيوب: يجب أن يكون الملف الصوتي مملوكًا لوعي." },
  );

/**
 * Validates the admin episode-edit form at the server-action boundary.
 * Kept narrow on purpose: only the fields the editor exposes today
 * (title/description/status/audioUrl) — extend alongside the editor, not ahead of it.
 */
export const episodeEditSchema = z.object({
  title: z.string().trim().min(3, "العنوان قصير جدًا.").max(160, "العنوان طويل جدًا."),
  description: z.string().trim().min(10, "الوصف قصير جدًا.").max(600, "الوصف طويل جدًا."),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"], { message: "اختر حالة صحيحة." }),
  audioUrl: audioUrlField,
});

export type EpisodeEditInput = z.infer<typeof episodeEditSchema>;
