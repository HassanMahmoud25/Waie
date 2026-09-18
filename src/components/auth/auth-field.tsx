"use client";

import { useId, useState } from "react";
import type { ComponentType } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type IconComponent = ComponentType<{ size?: number; className?: string }>;

export function AuthField({
  label,
  icon: Icon,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  hint,
  autoComplete,
  required = true,
}: {
  label: string;
  icon: IconComponent;
  type?: "text" | "email" | "password";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  const id = useId();
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword ? (revealed ? "text" : "password") : type;

  return (
    <div className={cn("field", error && "field--error")}>
      <label htmlFor={id} className="field__label">
        {label}
      </label>
      <div className="field__control">
        <Icon size={18} className="field__icon" aria-hidden="true" />
        <input
          id={id}
          type={resolvedType}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn("field__input", isPassword && "field__input--with-toggle")}
        />
        {isPassword && (
          <button
            type="button"
            className="field__toggle"
            onClick={() => setRevealed((prev) => !prev)}
            aria-label={revealed ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
          >
            {revealed ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>
      {error ? (
        <span id={`${id}-error`} className="field__error" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className="field__hint">{hint}</span>
      ) : null}
    </div>
  );
}
