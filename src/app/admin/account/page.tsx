import type { Metadata } from "next";
import { Mail, ShieldCheck, UserRound } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { ChangePasswordForm } from "@/components/admin/change-password-form";
import { requireAdmin } from "@/lib/auth/server";
import { minPasswordLengthFor } from "@/lib/auth/password-policy";

export const metadata: Metadata = { title: "الحساب والأمان" };

/** The signed-in admin's own account: who they are, and changing their password. */
export default async function AdminAccountPage() {
  const admin = await requireAdmin();

  return (
    <AdminShell
      eyebrow="الحساب"
      title="الحساب والأمان"
      description="بيانات حسابك في لوحة الإدارة، وتغيير كلمة المرور."
      back={{ label: "لوحة الإدارة", href: "/admin" }}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-start">
        <section className="admin-panel" aria-labelledby="account-heading">
          <div className="admin-panel__head">
            <h2 id="account-heading" className="admin-panel__title">
              الحساب
            </h2>
          </div>
          <dl className="flex flex-col gap-4 p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <span className="admin-tile">
                <UserRound size={20} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <dt className="text-sm font-bold text-[var(--ink-soft)]">الاسم</dt>
                <dd className="truncate font-extrabold">{admin.name ?? "—"}</dd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="admin-tile">
                <Mail size={20} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <dt className="text-sm font-bold text-[var(--ink-soft)]">البريد الإلكتروني</dt>
                <dd className="truncate font-extrabold" dir="ltr">
                  {admin.email}
                </dd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="admin-tile">
                <ShieldCheck size={20} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <dt className="text-sm font-bold text-[var(--ink-soft)]">الصلاحية</dt>
                <dd className="font-extrabold">مدير</dd>
              </div>
            </div>
          </dl>
        </section>

        <section className="admin-panel" aria-labelledby="password-heading">
          <div className="admin-panel__head flex-col items-start gap-1">
            <h2 id="password-heading" className="admin-panel__title">
              تغيير كلمة المرور
            </h2>
            <p className="text-sm leading-7 text-[var(--ink-soft)]">
              بعد التغيير ستبقى مسجّلًا على هذا الجهاز، ويُسجَّل خروجك تلقائيًا من أي جهاز آخر، وتصلك رسالة تأكيد على بريدك.
            </p>
          </div>
          <ChangePasswordForm minLength={minPasswordLengthFor(admin.role)} />
        </section>
      </div>
    </AdminShell>
  );
}
