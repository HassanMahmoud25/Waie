"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, Loader2, Mail, MailCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { AuthField } from "@/components/auth/auth-field";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUBMIT_DELAY_MS = 550;

export function ForgotPasswordForm() {
  const { requestPasswordReset } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setError(null);

    if (!email.trim()) {
      setError("أدخل بريدك الإلكتروني.");
      return;
    }
    if (!EMAIL_PATTERN.test(email)) {
      setError("صيغة البريد الإلكتروني غير صحيحة.");
      return;
    }

    setIsSubmitting(true);
    window.setTimeout(() => {
      const result = requestPasswordReset(email);
      setIsSubmitting(false);
      if (!result.ok) {
        setFormError(result.error);
        return;
      }
      setSent(true);
    }, SUBMIT_DELAY_MS);
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-[color-mix(in_srgb,var(--brand)_16%,var(--paper))] text-[var(--brand-deep)]">
          <MailCheck size={26} />
        </span>
        <p className="text-sm font-bold leading-7 text-[var(--ink-soft)]">
          إن وُجد حساب مرتبط بالبريد <span className="text-[var(--ink)]">{email}</span>، فسنرسل إليه رابط إعادة تعيين
          كلمة المرور خلال دقائق.
        </p>
        <button type="button" className="text-sm font-bold text-[var(--accent-strong)] hover:underline" onClick={() => setSent(false)}>
          لم يصلك شيء؟ أعد المحاولة
        </button>
        <Link href="/login" className="btn btn-secondary mt-2 w-full">
          <ArrowRight size={16} /> العودة إلى تسجيل الدخول
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
        <AuthField
          label="البريد الإلكتروني"
          icon={Mail}
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="name@example.com"
          autoComplete="email"
          error={error ?? undefined}
        />

        <button type="submit" className="btn btn-primary mt-6 w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 size={17} className="animate-spin" /> جارٍ الإرسال…
            </>
          ) : (
            "إرسال رابط إعادة التعيين"
          )}
        </button>
      </form>

      <p className="mt-7 text-center text-sm font-bold text-[var(--ink-soft)]">
        تذكّرت كلمة المرور؟{" "}
        <Link href="/login" className="text-[var(--ink)] hover:underline">
          سجّل الدخول
        </Link>
      </p>
    </>
  );
}
