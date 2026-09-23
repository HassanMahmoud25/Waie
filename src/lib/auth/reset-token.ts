import { randomBytes, createHash } from "node:crypto";
import { prisma } from "@/lib/db/prisma";

/**
 * Password reset tokens (see prisma/schema.prisma's PasswordResetToken).
 *
 * The token itself is 256 bits of random data -- already far too much
 * entropy to brute-force -- so unlike passwords (lib/auth/password.ts,
 * intentionally slow scrypt to resist guessing a *low*-entropy human
 * secret), the token only needs a fast, one-way hash: SHA-256 is the
 * correct, standard choice here, not scrypt. The raw token exists only in
 * the reset email/URL; only its hash is ever written to the database.
 */
const TOKEN_BYTES = 32;

/** 30 minutes -- inside the 30-60 minute window a reset link should reasonably stay valid. */
export const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** A fresh single-use token plus the hash that gets stored. */
export function createResetToken(): { token: string; tokenHash: string } {
  const token = randomBytes(TOKEN_BYTES).toString("base64url");
  return { token, tokenHash: hashResetToken(token) };
}

/**
 * Looks up a raw token (as received from the reset URL) and returns its
 * record only if it's genuinely usable right now: exists, unexpired, and
 * not already consumed. Returns null for anything else -- callers must
 * never distinguish *why* a token is invalid in anything shown to the user.
 *
 * Plain server-side helper, not a Server Action -- called both by the
 * /reset-password page (an upfront validity check, for UX) and by
 * resetPasswordAction (the authoritative check, right before mutating).
 */
export async function getValidResetToken(token: string) {
  if (!token || !process.env.DATABASE_URL) return null;

  const tokenHash = hashResetToken(token);
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!record || record.usedAt || record.expiresAt < new Date()) return null;

  return record;
}
