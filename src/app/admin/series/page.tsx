import type { Metadata } from "next";
import { contentRepository } from "@/lib/repositories";
import { AdminShell } from "@/components/admin/admin-shell";
import { StatusBadge } from "@/components/admin/status-badge";
import { ComingNextPanel } from "@/components/admin/coming-next-panel";

export const metadata: Metadata = { title: "السلاسل" };

export default async function AdminSeriesPage() {
  const series = await contentRepository.listSeries();

  return (
    <AdminShell
      title="السلاسل"
      description={`${series.length} سلسلة.`}
      back={{ label: "لوحة الإدارة", href: "/admin" }}
    >
      <div className="border-t border-[var(--line)]">
        {series.map((s) => (
          <div key={s.id} className="flex items-center justify-between gap-4 border-b border-[var(--line)] py-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={s.status} />
              </div>
              <b className="mt-2 block truncate text-lg">{s.title}</b>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">{s.episodeCount} حلقة</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <ComingNextPanel title="إنشاء وتعديل السلاسل">
          يحتاج هذا القسم إلى قاعدة بيانات موصولة (Prisma) ليصبح قابلًا للتعديل من هنا. حاليًا يمكن تعديل بيانات السلاسل
          مباشرة في <code className="rounded bg-[var(--surface)] px-1.5 py-0.5 text-sm">src/data/series.ts</code>.
        </ComingNextPanel>
      </div>
    </AdminShell>
  );
}
