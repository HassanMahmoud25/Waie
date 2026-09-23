"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { hashPassword, verifyAgainstDummy, verifyPassword } from "@/lib/auth/password";
import {
  SESSION_COOKIE,
  SESSION_TTL_DEFAULT_S,
  SESSION_TTL_REMEMBER_S,
  createSessionToken,
} from "@/lib/auth/session";
import { LOGIN_PATH, safeNextPath } from "@/lib/auth/server";
import { signupSchema, requestPasswordResetSchema, resetPasswordSchema } from "@/lib/validation/auth";
import { createResetToken, getValidResetToken, RESET_TOKEN_TTL_MS } from "@/lib/auth/reset-token";
import { sendPasswordResetEmail } from "@/lib/auth/email";
import { siteConfig } from "@/config/site";

export type ServerLoginResult =
  | { ok: true; redirectTo: string }
  /** No server-side account matched -- there is no other account system to fall back to. */
  | { ok: false };

/**
 * Tries the credentials against real, database-backed accounts. On success it
 * sets the HttpOnly session cookie. It never says *why* it failed (unknown
 * email vs wrong password vs no database), so it can't be used to probe for
 * accounts.
 */
export async function serverLoginAction(
  email: string,
  password: string,
  remember: boolean,
  next: string | null,
): Promise<ServerLoginResult> {
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) return { ok: false };
  if (password.length > 1024) return { ok: false };
  if (!process.env.DATABASE_URL) return { ok: false };

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true, role: true, passwordHash: true },
    });

    const valid = user?.passwordHash
      ? await verifyPassword(password, user.passwordHash)
      : await verifyAgainstDummy(password);
    if (!user || !valid) return { ok: false };

    const ttl = remember ? SESSION_TTL_REMEMBER_S : SESSION_TTL_DEFAULT_S;
    (await cookies()).set(SESSION_COOKIE, await createSessionToken(user.id, ttl), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      // "Don't remember me" -> a session cookie that dies with the browser.
      ...(remember ? { maxAge: ttl } : {}),
    });

    const destination = user.role === "ADMIN" ? (safeNextPath(next) ?? "/admin") : "/library";
    return { ok: true, redirectTo: destination };
  } catch (error) {
    console.error("serverLoginAction failed:", error);
    return { ok: false };
  }
}

export async function logoutAction(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  redirect(LOGIN_PATH);
}

export type ServerSignupResult =
  | { ok: true; redirectTo: string }
  | { ok: false; error: string; field?: "name" | "email" | "password" };

/**
 * Creates a real, database-backed account and signs the person in with the
 * same kind of session cookie serverLoginAction issues -- there is no second
 * session mechanism here. Role is never accepted from the caller: every
 * account created here is hardcoded to USER, the same way scripts/create-admin.ts
 * hardcodes ADMIN for its own path. Never returns or logs the raw password.
 */
export async function serverSignupAction(name: string, email: string, password: string): Promise<ServerSignupResult> {
  const parsed = signupSchema.safeParse({ name, email, password });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue?.path[0] as "name" | "email" | "password" | undefined;
    return { ok: false, error: issue?.message ?? "تحقّق من البيانات المدخلة.", field };
  }

  if (!process.env.DATABASE_URL) {
    return { ok: false, error: "إنشاء الحساب غير متاح حاليًا." };
  }

  const { name: cleanName, email: normalizedEmail, password: cleanPassword } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail }, select: { id: true } });
    if (existing) {
      return { ok: false, error: "هذا البريد الإلكتروني مسجّل بالفعل، جرّب تسجيل الدخول.", field: "email" };
    }

    const passwordHash = await hashPassword(cleanPassword);
    const user = await prisma.user.create({
      data: { email: normalizedEmail, name: cleanName, passwordHash, role: "USER" },
      select: { id: true },
    });

    (await cookies()).set(SESSION_COOKIE, await createSessionToken(user.id, SESSION_TTL_REMEMBER_S), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_REMEMBER_S,
    });

    return { ok: true, redirectTo: "/library" };
  } catch (error) {
    // A concurrent signup for the same email can race past the findUnique check above --
    // the database's own unique constraint is the real guard; translate its violation
    // into the same clean message rather than leaking a raw Prisma error.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, error: "هذا البريد الإلكتروني مسجّل بالفعل، جرّب تسجيل الدخول.", field: "email" };
    }
    console.error("serverSignupAction failed:", error);
    return { ok: false, error: "حدث خطأ غير متوقع، حاول مرة أخرى." };
  }
}

/**
 * Always resolves the same way regardless of whether the email matches a
 * real account -- callers must never branch on anything else the promise
 * could reveal (including how long it took or whether it threw), so every
 * exit path below funnels into the same `{ ok: true }`.
 */
export type RequestPasswordResetResult = { ok: true };

/**
 * Step 1 of the reset flow. On a real match: deletes any outstanding unused
 * tokens for that user (so only the newest link is ever valid), issues a
 * fresh single-use token, stores only its hash, and emails the raw token as
 * a link. An account with no `passwordHash` (never had a real server
 * password) is treated exactly like "no account" -- there is nothing to
 * reset.
 */
export async function requestPasswordResetAction(email: unknown): Promise<RequestPasswordResetResult> {
  const parsed = requestPasswordResetSchema.safeParse({ email });
  if (!parsed.success || !process.env.DATABASE_URL) return { ok: true };

  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true, passwordHash: true },
    });

    if (user?.passwordHash) {
      await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });

      const { token, tokenHash } = createResetToken();
      await prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
      });

      const resetUrl = `${siteConfig.url}/reset-password?token=${token}`;
      await sendPasswordResetEmail(parsed.data.email, resetUrl).catch((error) => {
        console.error("sendPasswordResetEmail failed:", error);
      });
    }
  } catch (error) {
    console.error("requestPasswordResetAction failed:", error);
  }

  return { ok: true };
}

export type ResetPasswordResult = { ok: true } | { ok: false; error: string };

/**
 * Step 4 of the reset flow. Re-validates the token from scratch (never
 * trusts that an earlier page-load check is still true), then atomically
 * updates the password, marks this token used, and clears every other
 * outstanding token for the same user. Also clears this browser's own
 * session cookie: the current architecture's sessions are stateless signed
 * tokens with no server-side store (see lib/auth/session.ts), so other
 * already-issued sessions elsewhere cannot be revoked -- they simply expire
 * per their existing TTL (up to 12h, or 7 days with "remember me").
 */
export async function resetPasswordAction(token: unknown, password: unknown): Promise<ResetPasswordResult> {
  const parsed = resetPasswordSchema.safeParse({ token, password });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "تحقّق من البيانات المدخلة." };
  }

  if (!process.env.DATABASE_URL) {
    return { ok: false, error: "إعادة تعيين كلمة المرور غير متاحة حاليًا." };
  }

  try {
    const record = await getValidResetToken(parsed.data.token);
    if (!record) {
      return { ok: false, error: "رابط إعادة التعيين غير صالح أو منتهي الصلاحية." };
    }

    const passwordHash = await hashPassword(parsed.data.password);

    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      prisma.passwordResetToken.deleteMany({ where: { userId: record.userId, id: { not: record.id } } }),
    ]);

    (await cookies()).delete(SESSION_COOKIE);
    return { ok: true };
  } catch (error) {
    console.error("resetPasswordAction failed:", error);
    return { ok: false, error: "حدث خطأ غير متوقع، حاول مرة أخرى." };
  }
}
