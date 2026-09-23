"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2, Lock, ShieldAlert } from "lucide-react";
import { resetPasswordAction } from "@/lib/auth/actions";
import { AuthField } from "@/components/auth/auth-field";
import { PasswordStrength } from "@/components/auth/password-strength";

type Errors = { password?: string; confirm?: string };

/** Step 3-4 of the reset flow. `initiallyValid` comes from the page's own server-side check; the actual mutation on submit re-validates the token again regardless (see resetPasswordAction). */
export function ResetPasswordForm({ token, initiallyValid }: { token: string | null; initiallyValid: boolean }) {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token || !initiallyValid) {
    return (
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-[color-mix(in_srgb,#b3483a_14%,var(--paper))] text-[#b3483a]">
          <ShieldAlert size={26} />
        </span>
        <p className="text-sm font-bold leading-7 text-[var(--ink-soft)]">
          رابط إعادة التعيين غير صالح أو منتهي الصلاحية. اطلب رابطًا جديدًا للمتابعة.
        </p>
        <Link href="/forgot-password" className="btn btn-primary mt-2 w-full">
          طلب رابط جديد
        </Link>
      </div>
    );
  }

  function validate() {
    const next: Errors = {};
    if (password.length < 8) next.password = "كلمة المرور يجب أن تكون 8 أحرف على الأقل.";
    if (confirm !== password) next.confirm = "كلمتا المرور غير متطابقتين.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    const result = await resetPasswordAction(token, password).catch(
      (): Awaited<ReturnType<typeof resetPasswordAction>> => ({ ok: false, error: "حدث خطأ غير متوقع، حاول مرة أخرى." }),
    );
    setIsSubmitting(false);

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    setSuccess(true);
    window.setTimeout(() => {
      router.push("/login");
      router.refresh();
    }, 1500);
  }

  if (success) {
    return (
      <div className="auth-alert auth-alert--success" role="status">
        <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
        <span>تم تغيير كلمة المرور بنجاح، جارٍ تحويلك إلى تسجيل الدخول…</span>
      </div>
    );
  }

  return (
    <>
      {formError && (
        <div className="auth-alert auth-alert--error" role="alert">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <AuthField
            label="كلمة المرور الجديدة"
            icon={Lock}
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="8 أحرف على الأقل"
            autoComplete="new-password"
            error={errors.password}
          />
          <PasswordStrength password={password} />
        </div>
        <AuthField
          label="تأكيد كلمة المرور"
          icon={Lock}
          type="password"
          value={confirm}
          onChange={setConfirm}
          placeholder="أعد كتابة كلمة المرور"
          autoComplete="new-password"
          error={errors.confirm}
        />

        <button type="submit" className="btn btn-primary mt-6 w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 size={17} className="animate-spin" /> جارٍ الحفظ…
            </>
          ) : (
            "حفظ كلمة المرور الجديدة"
          )}
        </button>
      </form>
    </>
  );
}
