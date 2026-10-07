"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2, Lock, LogIn, ShieldAlert } from "lucide-react";
import { resetPasswordAction } from "@/lib/auth/actions";
import { AuthField } from "@/components/auth/auth-field";
import { PasswordStrength } from "@/components/auth/password-strength";
import { PASSWORD_MIN_LENGTH, passwordTooShortMessage } from "@/lib/auth/password-policy";

type Errors = { password?: string; confirm?: string };

/** Step 3-4 of the reset flow. `initiallyValid` comes from the page's own server-side check; the actual mutation on submit re-validates the token again regardless (see resetPasswordAction). */
export function ResetPasswordForm({
  token,
  initiallyValid,
  minLength = PASSWORD_MIN_LENGTH,
}: {
  token: string | null;
  initiallyValid: boolean;
  minLength?: number;
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [linkInvalid, setLinkInvalid] = useState(!token || !initiallyValid);

  if (!token || linkInvalid) {
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
    if (password.length < minLength) next.password = passwordTooShortMessage(minLength);
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
      if (result.invalidToken) setLinkInvalid(true);
      else setFormError(result.error);
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-2 text-center" role="status">
        <span className="grid size-14 place-items-center rounded-full bg-[color-mix(in_srgb,var(--brand)_16%,var(--paper))] text-[var(--brand-deep)]">
          <CheckCircle2 size={26} />
        </span>
        <p className="text-sm font-bold leading-7 text-[var(--ink-soft)]">
          تم تغيير كلمة المرور بنجاح، وسُجّل خروجك من جميع الأجهزة. سجّل الدخول الآن بكلمة المرور الجديدة.
        </p>
        <Link href="/login" className="btn btn-primary mt-2 w-full">
          <LogIn size={17} /> تسجيل الدخول
        </Link>
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
            placeholder={`${minLength} أحرف على الأقل`}
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
