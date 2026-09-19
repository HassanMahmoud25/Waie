import type { Metadata } from "next";
import { contentRepository } from "@/lib/repositories";
import { EPISODE_FORMS, SERIES_FORMS, TOPIC_FORMS, formatCount } from "@/lib/utils/format";
import { AdminShell } from "@/components/admin/admin-shell";
import { ComingNextPanel } from "@/components/admin/coming-next-panel";

export const metadata: Metadata = { title: "المواضيع" };

export default async function AdminTopicsPage() {
  const topics = await contentRepository.listTopics();

  return (
    <AdminShell
      title="المواضيع"
      description={`${formatCount(topics.length, TOPIC_FORMS)}.`}
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
                  {formatCount(topic.episodeCount, EPISODE_FORMS)} · {formatCount(topic.seriesCount, SERIES_FORMS)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <ComingNextPanel title="إنشاء وتعديل المواضيع">
          يحتاج هذا القسم إلى قاعدة بيانات موصولة (Prisma) ليصبح قابلًا للتعديل من هنا. حاليًا يمكن تعديل بيانات
          المواضيع مباشرة في <code className="rounded bg-[var(--surface)] px-1.5 py-0.5 text-sm">src/data/topics.ts</code>.
        </ComingNextPanel>
      </div>
    </AdminShell>
  );
}
