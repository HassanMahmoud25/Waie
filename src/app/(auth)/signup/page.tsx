import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = { title: "إنشاء حساب" };

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="انضم إلى وعي"
      title="أنشئ حسابك المجاني"
      subtitle="احفظ حلقاتك، ودوّن ملاحظاتك، وزامن مكتبتك عبر أجهزتك."
      quote="مكتبة واحدة لحلقات وعي، تتبعك أينما سجّلت الدخول."
    >
      <SignupForm />
    </AuthShell>
  );
}
