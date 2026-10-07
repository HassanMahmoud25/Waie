"use client";

import { useId, useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { CircleAlert, CircleCheck, Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { changePasswordAction } from "@/lib/auth/actions";
import { passwordTooShortMessage } from "@/lib/auth/password-policy";

type Field = "currentPassword" | "newPassword" | "confirmPassword";
type Errors = Partial<Record<Field, string>>;

/**
 * The admin's own password change. Client checks here are for fast feedback
 * only -- changePasswordAction re-validates everything and verifies the
 * current password against the database itself.
 */
export function ChangePasswordForm({ minLength }: { minLength: number }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function validate() {
    const next: Errors = {};
    if (!currentPassword) next.currentPassword = "أدخل كلمة المرور الحالية.";
    if (newPassword.length < minLength) next.newPassword = passwordTooShortMessage(minLength);
    else if (newPassword === currentPassword) next.newPassword = "اختر كلمة مرور مختلفة عن كلمة المرور الحالية.";
    if (confirmPassword !== newPassword) next.confirmPassword = "كلمتا المرور غير متطابقتين.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setSuccess(false);
    if (!validate()) return;

    startTransition(async () => {
      const result = await changePasswordAction(currentPassword, newPassword).catch(
        (): Awaited<ReturnType<typeof changePasswordAction>> => ({ ok: false, error: "حدث خطأ غير متوقع، حاول مرة أخرى." }),
      );
      if (!result.ok) {
        if (result.field) setErrors({ [result.field]: result.error });
        else setFormError(result.error);
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
      setSuccess(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 p-4 sm:p-5">
      {success && (
        <p role="status" className="admin-notice admin-notice--success font-bold">
          <CircleCheck size={17} aria-hidden="true" />
          تم تغيير كلمة المرور بنجاح. ستبقى مسجّلًا هنا، وسُجّل خروجك من أي جهاز آخر.
        </p>
      )}
      {formError && (
        <p role="alert" className="admin-notice admin-notice--danger font-bold">
          <CircleAlert size={17} aria-hidden="true" />
          {formError}
        </p>
      )}

      <PasswordField
        label="كلمة المرور الحالية"
        value={currentPassword}
        onChange={setCurrentPassword}
        autoComplete="current-password"
        error={errors.currentPassword}
      />
      <PasswordField
        label="كلمة المرور الجديدة"
        value={newPassword}
        onChange={setNewPassword}
        autoComplete="new-password"
        error={errors.newPassword}
        hint={`${minLength} أحرف على الأقل. يُفضّل مزج الحروف والأرقام والرموز.`}
      />
      <PasswordField
        label="تأكيد كلمة المرور الجديدة"
        value={confirmPassword}
        onChange={setConfirmPassword}
        autoComplete="new-password"
        error={errors.confirmPassword}
      />

      <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/forgot-password" className="text-center text-sm font-bold text-[var(--accent-strong)] hover:underline">
          نسيت كلمة المرور الحالية؟
        </Link>
        <Button
          type="submit"
          disabled={isPending}
          aria-busy={isPending}
          icon={isPending ? <Loader2 className="animate-spin" size={16} aria-hidden="true" /> : <KeyRound size={16} aria-hidden="true" />}
          iconPosition="start"
        >
          {isPending ? "جارٍ الحفظ…" : "تغيير كلمة المرور"}
        </Button>
      </div>
    </form>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  error,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  error?: string;
  hint?: string;
}) {
  const id = useId();
  const [revealed, setRevealed] = useState(false);
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div>
      <label htmlFor={id} className="admin-label">
        {label}
      </label>
      <div className="relative mt-2">
        <input
          id={id}
          type={revealed ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          required
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className="admin-field mt-0 pe-12"
          style={error ? { borderColor: "#c0392b" } : undefined}
        />
        <button
          type="button"
          onClick={() => setRevealed((prev) => !prev)}
          aria-label={revealed ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
          aria-pressed={revealed}
          className="absolute inset-y-0 end-0 grid w-12 place-items-center rounded-e-[14px] text-[var(--ink-soft)] hover:text-[var(--ink)]"
        >
          {revealed ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
        </button>
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-2 text-sm font-bold text-[#8c2b20]">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-2 text-sm text-[var(--ink-soft)]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
