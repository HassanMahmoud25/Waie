/**
 * The one password policy, shared by the server-side schemas
 * (lib/validation/auth.ts), the client forms and scripts/create-admin.ts --
 * no dependencies, so it's safe to import from client components.
 *
 * Admin accounts keep the stricter floor scripts/create-admin.ts has always
 * required: resetting or changing an admin password must never be a way to
 * end up below the bar the account was created with.
 */
export const PASSWORD_MIN_LENGTH = 8;
export const ADMIN_PASSWORD_MIN_LENGTH = 12;
/** Guards against pathologically long input reaching scrypt. */
export const PASSWORD_MAX_LENGTH = 1024;

export function minPasswordLengthFor(role: "USER" | "ADMIN"): number {
  return role === "ADMIN" ? ADMIN_PASSWORD_MIN_LENGTH : PASSWORD_MIN_LENGTH;
}

export function passwordTooShortMessage(min: number): string {
  return `كلمة المرور يجب أن تكون ${min} أحرف على الأقل.`;
}
