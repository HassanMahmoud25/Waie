import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = { title: "إنشاء حساب" };

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="انضم إلى وعي"
      title="أنشئ حسابك المجاني"
      subtitle="احفظ حلقاتك، وتابع تقدّمك، وزامن مكتبتك عبر أجهزتك."
      quote="«كل حلقة تُسمع بوعي، تفتح بابًا لفكرة تستحق أن تُعاش.»"
    >
      <SignupForm />
    </AuthShell>
  );
}
