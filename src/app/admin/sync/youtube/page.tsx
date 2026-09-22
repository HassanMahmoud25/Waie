import type { Metadata } from "next";
import { History, TriangleAlert } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { EmptyState } from "@/components/content/empty-state";
import { prisma } from "@/lib/db/prisma";
import { cn } from "@/lib/utils/cn";
import { formatArabicDate } from "@/lib/utils/format";
import { SyncPanel } from "./sync-panel";
import { requireAdmin } from "@/lib/auth/server";

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

const statusClass: Record<string, string> = {
  RUNNING: "admin-status--draft admin-status--running",
  SUCCEEDED: "admin-status--published",
  FAILED: "admin-status--failed",
};

/** File names and env vars are LTR tokens; isolating them stops the RTL bidi algorithm from moving the leading dot of ".env.local". */
function Code({ children }: { children: string }) {
  return (
    <code dir="ltr" className="rounded-md bg-white/70 px-1.5 py-0.5 text-[.8rem] text-[var(--ink)]">
      {children}
    </code>
  );
}

export default async function AdminYouTubeSyncPage() {
  await requireAdmin();
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
        <div className="admin-notice admin-notice--warning mb-6" role="status">
          <TriangleAlert size={20} aria-hidden="true" />
          <div>
            <b className="block text-[var(--ink)]">الإعداد غير مكتمل</b>
            {!hasDatabase && (
              <p>
                أضف <Code>DATABASE_URL</Code> في <Code>.env.local</Code> لتفعيل قاعدة البيانات.
              </p>
            )}
            {!hasApiKey && (
              <p>
                أضف <Code>YOUTUBE_API_KEY</Code> في <Code>.env.local</Code> لتفعيل الاتصال بواجهة يوتيوب.
              </p>
            )}
            <p className="mt-1">أعد تشغيل الخادم بعد إضافة المتغيرات، ثم عُد لهذه الصفحة.</p>
          </div>
        </div>
      )}

      <SyncPanel />

      <section className="mt-10 sm:mt-12" aria-labelledby="sync-history-title">
        <h2 id="sync-history-title" className="mb-4 text-lg font-black tracking-[-.01em]">
          سجل عمليات المزامنة
        </h2>
        {recentRuns.length === 0 ? (
          <EmptyState icon={History} title="لا توجد عمليات مزامنة بعد." description="ستظهر هنا آخر عشر عمليات بعد تشغيل أول مزامنة." />
        ) : (
          <div className="admin-panel">
            {recentRuns.map((run) => (
              <div key={run.id} className="admin-row flex-wrap gap-y-2">
                <div className="min-w-0 flex-1 basis-48">
                  <p className="text-[.95rem] font-extrabold leading-[1.8]">{typeLabel[run.type] ?? run.type}</p>
                  <p className="meta">
                    <span>{formatArabicDate(run.startedAt)}</span>
                  </p>
                </div>
                <p className="meta">
                  <span>جديدة {run.videosCreated}</span>
                  <span>محدَّثة {run.videosUpdated}</span>
                  <span>تجاوز {run.videosSkipped}</span>
                </p>
                <div className="flex items-center gap-2">
                  {run.errors ? <span className="admin-status admin-status--draft">أخطاء</span> : null}
                  <span className={cn("admin-status", statusClass[run.status])}>
                    {statusLabel[run.status] ?? run.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </AdminShell>
  );
}
