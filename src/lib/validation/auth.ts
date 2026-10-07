import { z } from "zod";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  passwordTooShortMessage,
} from "@/lib/auth/password-policy";

/**
 * Validates the public signup form at the server-action boundary (never trust
 * the client's own validation). Mirrors the rest of the app's validation
 * pattern: one narrow schema per form, in Arabic error copy.
 */

/** A new password with the given floor (see lib/auth/password-policy.ts). */
export function newPasswordSchema(min: number = PASSWORD_MIN_LENGTH) {
  return z.string().min(min, passwordTooShortMessage(min)).max(PASSWORD_MAX_LENGTH, "كلمة المرور طويلة جدًا.");
}

export const signupSchema = z.object({
  name: z.string().trim().min(2, "أدخل اسمك الكامل.").max(80, "الاسم طويل جدًا."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "أدخل بريدك الإلكتروني.")
    .email("صيغة البريد الإلكتروني غير صحيحة."),
  password: newPasswordSchema(),
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

/**
 * The base floor only -- resetPasswordAction re-checks against the token
 * owner's role (admins need ADMIN_PASSWORD_MIN_LENGTH) once it knows who
 * the token belongs to.
 */
export const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, "رابط إعادة التعيين غير صالح."),
  password: newPasswordSchema(),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/** A signed-in user changing their own password; `min` depends on their role. */
export function changePasswordSchema(min: number = PASSWORD_MIN_LENGTH) {
  return z.object({
    currentPassword: z.string().min(1, "أدخل كلمة المرور الحالية.").max(PASSWORD_MAX_LENGTH, "كلمة المرور طويلة جدًا."),
    newPassword: newPasswordSchema(min),
  });
}

export type ChangePasswordInput = z.infer<ReturnType<typeof changePasswordSchema>>;
