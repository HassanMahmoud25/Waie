"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Lock, LogIn, Mail } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { AuthField } from "@/components/auth/auth-field";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUBMIT_DELAY_MS = 550;

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate() {
    const next: typeof errors = {};
    if (!email.trim()) next.email = "أدخل بريدك الإلكتروني.";
    else if (!EMAIL_PATTERN.test(email)) next.email = "صيغة البريد الإلكتروني غير صحيحة.";
    if (!password) next.password = "أدخل كلمة المرور.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    window.setTimeout(() => {
      const result = login(email, password);
      if (!result.ok) {
        setFormError(result.error);
        setIsSubmitting(false);
        return;
      }
      router.push("/library");
    }, SUBMIT_DELAY_MS);
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
          error={errors.email}
        />
        <AuthField
          label="كلمة المرور"
          icon={Lock}
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password}
        />

        <div className="mt-4 flex items-center justify-between gap-3">
          <label className="auth-check">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            تذكّرني
          </label>
          <Link href="/forgot-password" className="text-sm font-bold text-[var(--accent-strong)] hover:underline">
            نسيت كلمة المرور؟
          </Link>
        </div>

        <button type="submit" className="btn btn-primary mt-6 w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 size={17} className="animate-spin" /> جارٍ تسجيل الدخول…
            </>
          ) : (
            <>
              <LogIn size={17} /> تسجيل الدخول
            </>
          )}
        </button>
      </form>

      <div className="auth-divider">أو</div>

      <SocialRow />

      <p className="mt-7 text-center text-sm font-bold text-[var(--ink-soft)]">
        ليس لديك حساب؟{" "}
        <Link href="/signup" className="text-[var(--ink)] hover:underline">
          أنشئ حسابًا جديدًا
        </Link>
      </p>
    </>
  );
}

function SocialRow() {
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <div>
      <div className="auth-social-row">
        <button type="button" className="auth-social-btn" onClick={() => setNotice("تسجيل الدخول عبر جوجل غير متاح في هذا العرض التجريبي.")}>
          <GoogleMark /> جوجل
        </button>
        <button type="button" className="auth-social-btn" onClick={() => setNotice("تسجيل الدخول عبر آبل غير متاح في هذا العرض التجريبي.")}>
          <AppleMark /> آبل
        </button>
      </div>
      {notice && <p className="field__hint mt-2 text-center">{notice}</p>}
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.5 0-14 4.1-17.7 10.7z" />
      <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.5C29.6 34.9 26.9 36 24 36c-5.3 0-9.6-3.4-11.2-8l-6.6 5C9.9 39.6 16.4 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.6 5.5C41.5 36.3 44 30.6 44 24c0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.365 1.43c0 1.14-.462 2.15-1.213 2.914-.81.827-2.104 1.469-3.16 1.386-.12-1.098.434-2.27 1.19-3.02.79-.79 2.16-1.38 3.183-1.28zm3.31 16.71c-.394.91-.87 1.784-1.463 2.6-.79 1.07-1.61 2.14-2.9 2.16-1.27.02-1.68-.75-3.14-.75s-1.9.73-3.11.77c-1.24.04-2.19-1.15-2.99-2.22-1.63-2.21-2.88-6.25-1.2-8.98a4.45 4.45 0 0 1 3.75-2.26c1.19-.02 2.31.79 3.03.79.72 0 2.07-.98 3.5-.84a4.22 4.22 0 0 1 3.34 1.79c-2.94 1.7-2.46 6.1.18 6.94z" />
    </svg>
  );
}
