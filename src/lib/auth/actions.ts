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
import { signupSchema } from "@/lib/validation/auth";

export type ServerLoginResult =
  | { ok: true; redirectTo: string }
  /** No server-side account matched (or the server can't check) -- the caller may fall back to the local demo login. */
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
