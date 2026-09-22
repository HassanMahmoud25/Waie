import { z } from "zod";

/**
 * Validates the public signup form at the server-action boundary (never trust
 * the client's own validation). Mirrors episodeEditSchema's pattern: one
 * narrow schema per form, in Arabic error copy consistent with the rest of
 * the app.
 */
export const signupSchema = z.object({
  name: z.string().trim().min(2, "أدخل اسمك الكامل.").max(80, "الاسم طويل جدًا."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "أدخل بريدك الإلكتروني.")
    .email("صيغة البريد الإلكتروني غير صحيحة."),
  // Same floor as the existing public signup UI's own check (8 chars) -- kept
  // consistent rather than silently raising the bar server-side. The 1024 cap
  // mirrors serverLoginAction's guard against pathologically long input
  // reaching scrypt.
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل.").max(1024, "كلمة المرور طويلة جدًا."),
});

export type SignupInput = z.infer<typeof signupSchema>;
