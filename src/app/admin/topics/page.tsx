import type { Metadata } from "next";
import { contentRepository } from "@/lib/repositories";
import { AdminShell } from "@/components/admin/admin-shell";
import { ComingNextPanel } from "@/components/admin/coming-next-panel";

export const metadata: Metadata = { title: "الموضوعات" };

export default async function AdminTopicsPage() {
  const topics = await contentRepository.listTopics();

  return (
    <AdminShell
      title="الموضوعات"
      description={`${topics.length} موضوعات.`}
      back={{ label: "لوحة الإدارة", href: "/admin" }}
    >
      <div className="border-t border-[var(--line)]">
        {topics.map((topic) => (
          <div key={topic.id} className="flex items-center justify-between gap-4 border-b border-[var(--line)] py-4">
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: topic.color }}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <b className="block truncate text-lg">{topic.title}</b>
                <p className="mt-1 text-sm text-[var(--ink-soft)]">
                  {topic.episodeCount} حلقة · {topic.seriesCount} سلسلة
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <ComingNextPanel title="إنشاء وتعديل الموضوعات">
          يحتاج هذا القسم إلى قاعدة بيانات موصولة (Prisma) ليصبح قابلًا للتعديل من هنا. حاليًا يمكن تعديل بيانات
          الموضوعات مباشرة في <code className="rounded bg-[var(--surface)] px-1.5 py-0.5 text-sm">src/data/topics.ts</code>.
        </ComingNextPanel>
      </div>
    </AdminShell>
  );
}
