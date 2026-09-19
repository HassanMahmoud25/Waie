import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "تسجيل الدخول" };

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="أهلًا بعودتك"
      title="سجّل الدخول إلى وعي"
      subtitle="أكمل من حيث توقفت، وارجع إلى حلقاتك المحفوظة وملاحظاتك."
      quote="حلقاتك وملاحظاتك وتقدّمك في كل سلسلة، كما تركتها."
    >
      <LoginForm />
    </AuthShell>
  );
}
