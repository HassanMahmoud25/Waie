import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "تسجيل الدخول" };

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="أهلًا بعودتك"
      title="سجّل الدخول إلى وعي"
      subtitle="تابع من حيث توقفت: حلقاتك المحفوظة وتقدّمك محفوظان في انتظارك."
      quote="«مساحة ترتب المعرفة، وتعيدك إلى ما يستحق أن يُسمع ويتأمل.»"
    >
      <LoginForm />
    </AuthShell>
  );
}
