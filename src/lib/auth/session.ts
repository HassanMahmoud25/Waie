/**
 * Signed, stateless session token -- Web Crypto only, so it runs in both the
 * Node runtime (server actions, pages) and the Edge runtime (middleware).
 *
 * The token proves *who* (user id) and until *when*. It deliberately does NOT
 * carry the role: whether someone is an admin is looked up in the database on
 * every guarded request (src/lib/auth/server.ts), so demoting or deleting an
 * admin locks them out immediately instead of at token expiry.
 *
 * Format: base64url(JSON payload) + "." + base64url(HMAC-SHA256 signature).
 */
export const SESSION_COOKIE = "waie_session";

/** "Remember me" sessions last a week; otherwise the cookie dies with the browser and the token after 12h. */
export const SESSION_TTL_REMEMBER_S = 60 * 60 * 24 * 7;
export const SESSION_TTL_DEFAULT_S = 60 * 60 * 12;

const MIN_SECRET_LENGTH = 32;
const encoder = new TextEncoder();

type SessionPayload = { sub: string; iat: number; exp: number };

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> | null {
  try {
    const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

/** Fail closed: with no (or a weak) AUTH_SECRET nothing can be signed and nothing verifies. */
async function getKey(): Promise<CryptoKey | null> {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < MIN_SECRET_LENGTH) return null;
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

export async function createSessionToken(userId: string, ttlSeconds: number): Promise<string> {
  const key = await getKey();
  if (!key) throw new Error("AUTH_SECRET must be set to a random string of at least 32 characters.");

  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = { sub: userId, iat: now, exp: now + ttlSeconds };
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  return `${body}.${toBase64Url(new Uint8Array(signature))}`;
}

/** Returns the user id if the token is authentic and unexpired, otherwise null. */
export async function verifySessionToken(token: string | undefined | null): Promise<string | null> {
  if (!token) return null;
  const key = await getKey();
  if (!key) return null;

  const [body, signature, ...rest] = token.split(".");
  if (!body || !signature || rest.length > 0) return null;

  const signatureBytes = fromBase64Url(signature);
  if (!signatureBytes) return null;
  // crypto.subtle.verify compares in constant time.
  const authentic = await crypto.subtle.verify("HMAC", key, signatureBytes, encoder.encode(body));
  if (!authentic) return null;

  const payloadBytes = fromBase64Url(body);
  if (!payloadBytes) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as Partial<SessionPayload>;
    if (typeof payload.sub !== "string" || typeof payload.exp !== "number") return null;
    if (payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload.sub;
  } catch {
    return null;
  }
}
