"use client";

const LEVEL_COLORS = ["#b3483a", "#c98a3a", "#8a9a3a", "var(--brand)"];
const LEVEL_LABELS = ["ضعيفة", "مقبولة", "جيدة", "قوية"];

function scorePassword(password: string) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.max(1, score);
}

/** Live strength meter shown under the signup password field only. */
export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const score = scorePassword(password);
  const level = Math.min(score, 4);

  return (
    <div>
      <div className="auth-strength" aria-hidden="true">
        {[0, 1, 2, 3].map((index) => (
          <span key={index} style={{ background: index < level ? LEVEL_COLORS[level - 1] : undefined }} />
        ))}
      </div>
      <span className="field__hint mt-1 inline-block">قوة كلمة المرور: {LEVEL_LABELS[level - 1]}</span>
    </div>
  );
}
