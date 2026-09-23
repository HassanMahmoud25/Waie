import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { getValidResetToken } from "@/lib/auth/reset-token";

export const metadata: Metadata = { title: "إعادة تعيين كلمة المرور" };

/**
 * An upfront, page-load validity check (exists / unexpired / unused) so an
 * obviously-bad link (missing, garbage, expired, already-consumed) shows the
 * "invalid link" state immediately instead of after filling out the form.
 * resetPasswordAction re-validates the same token from scratch at submit
 * time regardless -- this check is for UX only, never the authoritative one.
 */
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { token: rawToken } = await searchParams;
  const token = typeof rawToken === "string" && rawToken.trim() !== "" ? rawToken : null;
  const isValid = token ? Boolean(await getValidResetToken(token)) : false;

  return (
    <AuthShell
      eyebrow="كلمة مرور جديدة"
      title="إعادة تعيين كلمة المرور"
      subtitle="اختر كلمة مرور جديدة لحسابك في وعي."
      quote="حسابك كما تركته، بكلمة مرور جديدة فقط."
    >
      <ResetPasswordForm token={token} initiallyValid={isValid} />
    </AuthShell>
  );
}
