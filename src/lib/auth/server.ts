import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { SESSION_COOKIE, readSessionToken } from "@/lib/auth/session";
import { logAuthError } from "@/lib/auth/log";

export const LOGIN_PATH = "/login";

export type SessionUser = { id: string; email: string; name: string | null; role: "USER" | "ADMIN" };

/**
 * The signed-in server-side user for this request, or null. Re-reads the user
 * (and therefore their role) from the database instead of trusting the cookie,
 * and is memoized per request so a layout, page and action can all call it
 * for the price of one query.
 *
 * Any failure -- no cookie, bad signature, expired token, revoked session
 * (password reset/changed since it was issued), deleted user, no database
 * configured, database down -- resolves to null (fail closed).
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const claims = await readSessionToken(token);
  if (!claims || !process.env.DATABASE_URL) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: claims.userId },
      select: { id: true, email: true, name: true, role: true, passwordHash: true, sessionVersion: true },
    });
    // A user with no password hash can't have legitimately obtained a session.
    if (!user?.passwordHash) return null;
    if (user.sessionVersion !== claims.version) return null;
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  } catch (error) {
    // Still fail closed, but loudly: a database outage or a schema behind the
    // code would otherwise just look like everyone being signed out.
    logAuthError("getSessionUser", error);
    return null;
  }
});

/**
 * The authoritative /admin gate. Call it in the admin layout, in every admin
 * page, and at the top of every admin server action -- middleware only does a
 * cheap signature check (Edge can't query Prisma), and server actions can be
 * POSTed to from anywhere, so this must not be skipped.
 *
 *  - not signed in  -> /login (middleware normally catches this first, with a `next` param)
 *  - signed in, not an admin -> back to the public site
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(LOGIN_PATH);
  if (user.role !== "ADMIN") redirect("/");
  return user;
}

/** Accepts only same-site absolute paths ("/admin/episodes"), never "//evil.com" or "https://...". */
export function safeNextPath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return null;
  return value;
}
