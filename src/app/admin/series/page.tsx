import type { Metadata } from "next";
import Link from "next/link";
import { Layers, Pencil } from "lucide-react";
import { EPISODE_FORMS, SERIES_FORMS, formatArabicDate, formatCount } from "@/lib/utils/format";
import { AdminShell } from "@/components/admin/admin-shell";
import { StatusBadge } from "@/components/admin/status-badge";
import { CreateSeriesForm } from "@/components/admin/create-series-form";
import { EmptyState } from "@/components/content/empty-state";
import { requireAdmin } from "@/lib/auth/server";
import { listSeriesForAdmin } from "@/lib/admin/content/series";
import { cn } from "@/lib/utils/cn";
import type { ContentStatus } from "@/types/content-status";

export const metadata: Metadata = { title: "السلاسل" };

const statusTabs: { key: string; label: string; status: ContentStatus | null }[] = [
  { key: "all", label: "الكل", status: null },
  { key: "published", label: "منشورة", status: "PUBLISHED" },
  { key: "draft", label: "مسودات", status: "DRAFT" },
  { key: "archived", label: "مؤرشفة", status: "ARCHIVED" },
];

export default async function AdminSeriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status: statusParam } = await searchParams;
  const activeTab = statusTabs.find((tab) => tab.key === statusParam) ?? statusTabs[0];

  // Admin-only, unfiltered data path: listSeriesForAdmin() (lib/admin/content/series.ts)
  // returns every status, unlike contentRepository.listSeries() (PUBLISHED-only).
  const allSeries = await listSeriesForAdmin();
  const series = activeTab.status ? allSeries.filter((s) => s.status === activeTab.status) : allSeries;

  return (
    <AdminShell
      title="السلاسل"
      description={`${formatCount(allSeries.length, SERIES_FORMS)} — أنشئ سلسلة جديدة أو عدّل بياناتها وحالة نشرها.`}
      back={{ label: "لوحة الإدارة", href: "/admin" }}
    >
      <CreateSeriesForm />

      <nav className="admin-tabs mt-6" aria-label="تصفية حسب الحالة">
        {statusTabs.map((tab) => {
          const count = tab.status ? allSeries.filter((s) => s.status === tab.status).length : allSeries.length;
          return (
            <Link
              key={tab.key}
              href={tab.key === "all" ? "/admin/series" : `/admin/series?status=${tab.key}`}
              aria-current={tab.key === activeTab.key ? "page" : undefined}
              className="admin-tab"
            >
              {tab.label}
              <span className="opacity-70">{count}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4">
        {series.length > 0 ? (
          <div className="admin-panel">
            {series.map((s) => (
              <div key={s.id} className={cn("admin-row")}>
                <span className="admin-tile">
                  <Layers size={20} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <StatusBadge status={s.status} />
                  </div>
                  <p className="admin-row__title">{s.title}</p>
                  <p className="meta mt-1">
                    <span dir="ltr">/{s.slug}</span>
                    <span>{formatCount(s._count.episodes, EPISODE_FORMS)}</span>
                    <span>حُدّثت {formatArabicDate(s.updatedAt)}</span>
                  </p>
                </div>
                <Link
                  href={`/admin/series/${s.id}`}
                  className="btn btn-secondary shrink-0 max-sm:size-11 max-sm:min-h-0 max-sm:rounded-full max-sm:p-0"
                  aria-label={`تعديل: ${s.title}`}
                >
                  <Pencil size={15} aria-hidden="true" />
                  <span className="max-sm:hidden">تعديل</span>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Layers}
            title="لا توجد سلاسل هنا."
            description={activeTab.status ? "لا توجد سلاسل بهذه الحالة حاليًا." : "أضف سلسلة جديدة من الحقل أعلاه."}
          />
        )}
      </div>
    </AdminShell>
  );
}
