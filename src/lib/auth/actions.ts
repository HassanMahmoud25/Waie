"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { hashPassword, verifyAgainstDummy, verifyPassword } from "@/lib/auth/password";
import { minPasswordLengthFor, passwordTooShortMessage } from "@/lib/auth/password-policy";
import {
  SESSION_COOKIE,
  SESSION_TTL_DEFAULT_S,
  SESSION_TTL_REMEMBER_S,
  createSessionToken,
  readSessionToken,
} from "@/lib/auth/session";
import { LOGIN_PATH, getSessionUser, safeNextPath } from "@/lib/auth/server";
import {
  changePasswordSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  signupSchema,
} from "@/lib/validation/auth";
import {
  RESET_REQUESTS_PER_WINDOW,
  RESET_REQUEST_COOLDOWN_MS,
  RESET_REQUEST_WINDOW_MS,
  RESET_TOKEN_RETENTION_MS,
  RESET_TOKEN_TTL_MS,
  createResetToken,
  getValidResetToken,
} from "@/lib/auth/reset-token";
import { sendPasswordChangedEmail, sendPasswordResetEmail } from "@/lib/auth/email";
import { siteConfig } from "@/config/site";
import { logAuthError } from "@/lib/auth/log";

/** The one place the session cookie is written. `remember` false -> a browser-session cookie. */
async function setSessionCookie(userId: string, sessionVersion: number, remember: boolean): Promise<void> {
  const ttl = remember ? SESSION_TTL_REMEMBER_S : SESSION_TTL_DEFAULT_S;
  (await cookies()).set(SESSION_COOKIE, await createSessionToken(userId, ttl, sessionVersion), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // "Don't remember me" -> a session cookie that dies with the browser.
    ...(remember ? { maxAge: ttl } : {}),
  });
}

/** Fire-and-forget after the response: a slow or failing mail provider never delays or fails the action. */
function notifyPasswordChanged(email: string): void {
  after(() =>
    sendPasswordChangedEmail(email).catch((error) => {
      logAuthError("sendPasswordChangedEmail", error);
    }),
  );
}

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
      select: { id: true, role: true, passwordHash: true, sessionVersion: true },
    });

    const valid = user?.passwordHash
      ? await verifyPassword(password, user.passwordHash)
      : await verifyAgainstDummy(password);
    if (!user || !valid) return { ok: false };

    await setSessionCookie(user.id, user.sessionVersion, remember);

    const destination = user.role === "ADMIN" ? (safeNextPath(next) ?? "/admin") : "/library";
    return { ok: true, redirectTo: destination };
  } catch (error) {
    logAuthError("serverLoginAction", error);
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
      select: { id: true, sessionVersion: true },
    });

    await setSessionCookie(user.id, user.sessionVersion, true);

    return { ok: true, redirectTo: "/library" };
  } catch (error) {
    // A concurrent signup for the same email can race past the findUnique check above --
    // the database's own unique constraint is the real guard; translate its violation
    // into the same clean message rather than leaking a raw Prisma error.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, error: "هذا البريد الإلكتروني مسجّل بالفعل، جرّب تسجيل الدخول.", field: "email" };
    }
    logAuthError("serverSignupAction", error);
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
 * Step 1 of the reset flow. Only validates the input before answering: the
 * account lookup, throttling, token issuing and email delivery all run in
 * `after()`, once the response is already on its way, so neither the
 * response time nor an error can reveal whether the address has an account.
 */
export async function requestPasswordResetAction(email: unknown): Promise<RequestPasswordResetResult> {
  const parsed = requestPasswordResetSchema.safeParse({ email });
  if (!parsed.success || !process.env.DATABASE_URL) return { ok: true };

  const normalizedEmail = parsed.data.email;
  after(() => issuePasswordReset(normalizedEmail));
  return { ok: true };
}

/**
 * On a real match: drops the request if the account is over its throttle
 * (see RESET_REQUEST_* in reset-token.ts), otherwise expires any outstanding
 * link (only the newest is ever valid), issues a fresh single-use token,
 * stores only its hash, and emails the raw token as a link. An account with
 * no `passwordHash` (never had a real server password) is treated exactly
 * like "no account" -- there is nothing to reset.
 */
async function issuePasswordReset(email: string): Promise<void> {
  try {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true, passwordHash: true } });
    if (!user?.passwordHash) return;

    const now = Date.now();
    const recent = await prisma.passwordResetToken.findMany({
      where: { userId: user.id, createdAt: { gt: new Date(now - RESET_REQUEST_WINDOW_MS) } },
      select: { createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    if (recent.length >= RESET_REQUESTS_PER_WINDOW) return;
    if (recent[0] && now - recent[0].createdAt.getTime() < RESET_REQUEST_COOLDOWN_MS) return;

    const { token, tokenHash } = createResetToken();
    await prisma.$transaction([
      // Superseded links are expired rather than deleted so they still count toward the throttle above.
      prisma.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null, expiresAt: { gt: new Date(now) } },
        data: { expiresAt: new Date(now) },
      }),
      prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt: new Date(now + RESET_TOKEN_TTL_MS) },
      }),
      // Opportunistic cleanup, across all accounts, of rows long past any use.
      prisma.passwordResetToken.deleteMany({ where: { expiresAt: { lt: new Date(now - RESET_TOKEN_RETENTION_MS) } } }),
    ]);

    await sendPasswordResetEmail(user.email, `${siteConfig.url}/reset-password?token=${token}`);
  } catch (error) {
    logAuthError("issuePasswordReset", error);
  }
}

/** `invalidToken` lets the form switch to its "request a new link" state instead of a dead-end error. */
export type ResetPasswordResult = { ok: true } | { ok: false; error: string; invalidToken?: true };

const INVALID_RESET_LINK = "رابط إعادة التعيين غير صالح أو منتهي الصلاحية.";

/**
 * Step 4 of the reset flow. Re-validates the token from scratch (never
 * trusts that an earlier page-load check is still true) and applies the
 * owner's role-specific password floor. The token is claimed with a
 * conditional update, so two simultaneous submits of one link can't both
 * win; then the password is replaced, `sessionVersion` is bumped (signing
 * the account out on every device -- whoever triggered the reset may hold a
 * session) and every other outstanding token for the user is deleted. The
 * person then signs in again with the new password.
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
    if (!record) return { ok: false, error: INVALID_RESET_LINK, invalidToken: true };

    const min = minPasswordLengthFor(record.user.role);
    if (parsed.data.password.length < min) return { ok: false, error: passwordTooShortMessage(min) };

    const passwordHash = await hashPassword(parsed.data.password);

    const now = new Date();
    const claimed = await prisma.passwordResetToken.updateMany({
      where: { id: record.id, usedAt: null, expiresAt: { gt: now } },
      data: { usedAt: now },
    });
    if (claimed.count !== 1) return { ok: false, error: INVALID_RESET_LINK, invalidToken: true };

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash, sessionVersion: { increment: 1 } },
      }),
      prisma.passwordResetToken.deleteMany({ where: { userId: record.userId, id: { not: record.id } } }),
    ]);

    (await cookies()).delete(SESSION_COOKIE);
    notifyPasswordChanged(record.user.email);
    return { ok: true };
  } catch (error) {
    logAuthError("resetPasswordAction", error);
    return { ok: false, error: "حدث خطأ غير متوقع، حاول مرة أخرى." };
  }
}

export type ChangePasswordResult =
  | { ok: true }
  | { ok: false; error: string; field?: "currentPassword" | "newPassword" };

const SESSION_EXPIRED = "انتهت جلستك، سجّل الدخول من جديد.";

/**
 * A signed-in user (admin or not) changing their own password. Identity
 * comes only from the server session -- there is no user id parameter, so
 * this can't touch anyone else's account -- and the current password is
 * verified server-side against the stored hash before anything changes.
 *
 * Bumping `sessionVersion` signs the account out everywhere else; this
 * browser gets a fresh cookie for the new version (same "remember me"
 * persistence as before) so the person who just proved the password isn't
 * kicked out mid-task. Any pending reset link is expired too.
 */
export async function changePasswordAction(currentPassword: unknown, newPassword: unknown): Promise<ChangePasswordResult> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return { ok: false, error: SESSION_EXPIRED };

  const parsed = changePasswordSchema(minPasswordLengthFor(sessionUser.role)).safeParse({ currentPassword, newPassword });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      error: issue?.message ?? "تحقّق من البيانات المدخلة.",
      field: issue?.path[0] as "currentPassword" | "newPassword" | undefined,
    };
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: sessionUser.id }, select: { passwordHash: true } });
    if (!user?.passwordHash) return { ok: false, error: SESSION_EXPIRED };

    if (!(await verifyPassword(parsed.data.currentPassword, user.passwordHash))) {
      return { ok: false, error: "كلمة المرور الحالية غير صحيحة.", field: "currentPassword" };
    }
    if (await verifyPassword(parsed.data.newPassword, user.passwordHash)) {
      return { ok: false, error: "اختر كلمة مرور مختلفة عن كلمة المرور الحالية.", field: "newPassword" };
    }

    const passwordHash = await hashPassword(parsed.data.newPassword);
    const now = new Date();
    const [updated] = await prisma.$transaction([
      prisma.user.update({
        where: { id: sessionUser.id },
        data: { passwordHash, sessionVersion: { increment: 1 } },
        select: { sessionVersion: true },
      }),
      prisma.passwordResetToken.updateMany({
        where: { userId: sessionUser.id, usedAt: null, expiresAt: { gt: now } },
        data: { expiresAt: now },
      }),
    ]);

    const claims = await readSessionToken((await cookies()).get(SESSION_COOKIE)?.value);
    const remembered = claims ? claims.expiresAt - claims.issuedAt > SESSION_TTL_DEFAULT_S : false;
    await setSessionCookie(sessionUser.id, updated.sessionVersion, remembered);

    notifyPasswordChanged(sessionUser.email);
    return { ok: true };
  } catch (error) {
    logAuthError("changePasswordAction", error);
    return { ok: false, error: "حدث خطأ غير متوقع، حاول مرة أخرى." };
  }
}
