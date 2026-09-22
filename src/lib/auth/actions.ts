"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { verifyAgainstDummy, verifyPassword } from "@/lib/auth/password";
import {
  SESSION_COOKIE,
  SESSION_TTL_DEFAULT_S,
  SESSION_TTL_REMEMBER_S,
  createSessionToken,
} from "@/lib/auth/session";
import { LOGIN_PATH, safeNextPath } from "@/lib/auth/server";

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
