"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Lock, Mail, User, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { AuthField } from "@/components/auth/auth-field";
import { PasswordStrength } from "@/components/auth/password-strength";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUBMIT_DELAY_MS = 650;

type Errors = { name?: string; email?: string; password?: string; confirm?: string; terms?: string };

export function SignupForm() {
  const router = useRouter();
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function validate() {
    const next: Errors = {};
    if (name.trim().length < 2) next.name = "أدخل اسمك الكامل.";
    if (!email.trim()) next.email = "أدخل بريدك الإلكتروني.";
    else if (!EMAIL_PATTERN.test(email)) next.email = "صيغة البريد الإلكتروني غير صحيحة.";
    if (password.length < 8) next.password = "كلمة المرور يجب أن تكون 8 أحرف على الأقل.";
    if (confirm !== password) next.confirm = "كلمتا المرور غير متطابقتين.";
    if (!agreed) next.terms = "يجب الموافقة على الشروط للمتابعة.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    window.setTimeout(() => {
      const result = signup(name, email, password);
      if (!result.ok) {
        setFormError(result.error);
        setIsSubmitting(false);
        return;
      }
      setIsSubmitting(false);
      setSuccess(true);
      window.setTimeout(() => router.push("/library"), 1100);
    }, SUBMIT_DELAY_MS);
  }

  if (success) {
    return (
      <div className="auth-alert auth-alert--success" role="status">
        <UserPlus size={18} className="mt-0.5 shrink-0" />
        <span>تم إنشاء حسابك بنجاح، أهلًا بك في وعي! جارٍ تحويلك إلى مكتبتك…</span>
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
          label="الاسم الكامل"
          icon={User}
          value={name}
          onChange={setName}
          placeholder="اسمك كما تحب أن يظهر"
          autoComplete="name"
          error={errors.name}
        />
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
        <div className="field">
          <AuthField
            label="كلمة المرور"
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

        <div className="mt-5">
          <label className="auth-check auth-check--top">
            <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} />
            <span>
              أوافق على{" "}
              <Link href="#" className="font-bold text-[var(--ink)] hover:underline">
                شروط الاستخدام
              </Link>{" "}
              و
              <Link href="#" className="font-bold text-[var(--ink)] hover:underline">
                سياسة الخصوصية
              </Link>
            </span>
          </label>
          {errors.terms && (
            <span className="field__error mt-1.5 block" role="alert">
              {errors.terms}
            </span>
          )}
        </div>

        <button type="submit" className="btn btn-primary mt-6 w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 size={17} className="animate-spin" /> جارٍ إنشاء الحساب…
            </>
          ) : (
            <>
              <UserPlus size={17} /> إنشاء حساب
            </>
          )}
        </button>
      </form>

      <p className="mt-7 text-center text-sm font-bold text-[var(--ink-soft)]">
        لديك حساب بالفعل؟{" "}
        <Link href="/login" className="text-[var(--ink)] hover:underline">
          سجّل الدخول
        </Link>
      </p>
    </>
  );
}
