import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { safeNextPath } from "@/lib/auth/server";

export const metadata: Metadata = { title: "تسجيل الدخول" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const { next } = await searchParams;

  return (
    <AuthShell
      eyebrow="أهلًا بعودتك"
      title="سجّل الدخول إلى وعي"
      subtitle="أكمل من حيث توقفت، وارجع إلى حلقاتك المحفوظة وملاحظاتك."
      quote="حلقاتك وملاحظاتك وتقدّمك في كل سلسلة، كما تركتها."
    >
      <LoginForm next={safeNextPath(Array.isArray(next) ? next[0] : next)} />
    </AuthShell>
  );
}
