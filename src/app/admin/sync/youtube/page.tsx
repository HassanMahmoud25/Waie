import type { Metadata } from "next";
import { TriangleAlert } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { prisma } from "@/lib/db/prisma";
import { formatArabicDate } from "@/lib/utils/format";
import { SyncPanel } from "./sync-panel";

export const metadata: Metadata = { title: "مزامنة يوتيوب" };

const typeLabel: Record<string, string> = {
  FULL_IMPORT: "استيراد كامل",
  NEW_VIDEOS: "حلقات جديدة",
  METADATA: "بيانات وصفية",
  PLAYLISTS: "قوائم تشغيل",
};

const statusLabel: Record<string, string> = {
  RUNNING: "قيد التشغيل",
  SUCCEEDED: "نجح",
  FAILED: "فشل",
};

export default async function AdminYouTubeSyncPage() {
  const hasDatabase = Boolean(process.env.DATABASE_URL);
  const hasApiKey = Boolean(process.env.YOUTUBE_API_KEY);
  const isConfigured = hasDatabase && hasApiKey;

  const recentRuns = hasDatabase
    ? await prisma.syncRun
        .findMany({ orderBy: { startedAt: "desc" }, take: 10 })
        .catch(() => [])
    : [];

  return (
    <AdminShell
      title="مزامنة يوتيوب"
      description="استورد أرشيف قناة وعي وزامنها باستمرار دون فقدان أي تعديل تحريري."
      back={{ label: "لوحة الإدارة", href: "/admin" }}
    >
      {!isConfigured && (
        <div className="mb-8 flex items-start gap-3 border border-dashed border-[var(--accent-strong)] bg-[var(--surface)] p-5">
          <TriangleAlert className="mt-0.5 shrink-0 text-[var(--accent-strong)]" size={20} aria-hidden />
          <div className="text-sm leading-7 text-[var(--ink-soft)]">
            <b className="block text-[var(--ink)]">الإعداد غير مكتمل</b>
            {!hasDatabase && <p>أضف DATABASE_URL في .env.local لتفعيل قاعدة البيانات.</p>}
            {!hasApiKey && <p>أضف YOUTUBE_API_KEY في .env.local لتفعيل الاتصال بواجهة يوتيوب.</p>}
            <p className="mt-1">
              أعد تشغيل الخادم بعد إضافة المتغيرات، ثم عُد لهذه الصفحة.
            </p>
          </div>
        </div>
      )}

      <SyncPanel />

      <section className="mt-10">
        <h2 className="font-black">سجل عمليات المزامنة</h2>
        {recentRuns.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--ink-soft)]">لا توجد عمليات مزامنة بعد.</p>
        ) : (
          <div className="mt-4 flex flex-col gap-2">
            {recentRuns.map((run) => (
              <div
                key={run.id}
                className="flex flex-wrap items-center justify-between gap-3 bg-[var(--surface)] px-5 py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold">{typeLabel[run.type] ?? run.type}</span>
                  <span className="text-[var(--ink-soft)]">{formatArabicDate(run.startedAt)}</span>
                </div>
                <div className="flex items-center gap-4 text-[var(--ink-soft)]">
                  <span>{statusLabel[run.status] ?? run.status}</span>
                  <span>
                    +{run.videosCreated} / ~{run.videosUpdated} / تجاوز {run.videosSkipped}
                  </span>
                  {run.errors ? <span className="font-bold text-[var(--accent-strong)]">أخطاء</span> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </AdminShell>
  );
}
