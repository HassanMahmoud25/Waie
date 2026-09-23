import { z } from "zod";

/**
 * Validates the public signup form at the server-action boundary (never trust
 * the client's own validation). Mirrors the rest of the app's validation
 * pattern: one narrow schema per form, in Arabic error copy.
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

/** Same email shape as signup -- deliberately not stricter, so a valid signup email is always a valid reset-request email. */
export const requestPasswordResetSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "أدخل بريدك الإلكتروني.")
    .email("صيغة البريد الإلكتروني غير صحيحة."),
});

export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;

/** Same password floor as signup (8 chars, 1024 cap) -- resetting to a weaker bar than signup allows would be inconsistent. */
export const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, "رابط إعادة التعيين غير صالح."),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل.").max(1024, "كلمة المرور طويلة جدًا."),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
