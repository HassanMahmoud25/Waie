import type { Metadata } from "next";
import { Layers } from "lucide-react";
import { contentRepository } from "@/lib/repositories";
import { EPISODE_FORMS, SERIES_FORMS, formatCount } from "@/lib/utils/format";
import { AdminShell } from "@/components/admin/admin-shell";
import { StatusBadge } from "@/components/admin/status-badge";
import { ComingNextPanel } from "@/components/admin/coming-next-panel";
import { EmptyState } from "@/components/content/empty-state";
import { requireAdmin } from "@/lib/auth/server";

export const metadata: Metadata = { title: "السلاسل" };

export default async function AdminSeriesPage() {
  await requireAdmin();
  const series = await contentRepository.listSeries();

  return (
    <AdminShell
      title="السلاسل"
      description={`${formatCount(series.length, SERIES_FORMS)}.`}
      back={{ label: "لوحة الإدارة", href: "/admin" }}
    >
      {series.length > 0 ? (
        <div className="admin-panel">
          {series.map((s) => (
            <div key={s.id} className="admin-row">
              <span className="admin-tile">
                <Layers size={20} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-extrabold leading-[1.8]">{s.title}</p>
                <p className="text-sm text-[var(--ink-soft)]">{formatCount(s.episodeCount, EPISODE_FORMS)}</p>
              </div>
              <StatusBadge status={s.status} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={Layers} title="لا توجد سلاسل بعد." description="تُنشأ السلاسل تلقائيًا من قوائم تشغيل يوتيوب عند المزامنة." />
      )}

      <div className="mt-6 sm:mt-8">
        <ComingNextPanel title="إنشاء وتعديل السلاسل">
          يحتاج هذا القسم إلى قاعدة بيانات موصولة (Prisma) ليصبح قابلًا للتعديل من هنا. حاليًا يمكن تعديل بيانات السلاسل
          مباشرة في{" "}
          <code dir="ltr" className="rounded-md bg-white/70 px-1.5 py-0.5 text-[.8rem]">
            src/data/series.ts
          </code>
          .
        </ComingNextPanel>
      </div>
    </AdminShell>
  );
}
