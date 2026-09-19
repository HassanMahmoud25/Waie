import type { Metadata } from "next";
import { Tag } from "lucide-react";
import { contentRepository } from "@/lib/repositories";
import { EPISODE_FORMS, SERIES_FORMS, TOPIC_FORMS, formatCount } from "@/lib/utils/format";
import { AdminShell } from "@/components/admin/admin-shell";
import { ComingNextPanel } from "@/components/admin/coming-next-panel";
import { EmptyState } from "@/components/content/empty-state";

export const metadata: Metadata = { title: "المواضيع" };

export default async function AdminTopicsPage() {
  const topics = await contentRepository.listTopics();

  return (
    <AdminShell
      title="المواضيع"
      description={`${formatCount(topics.length, TOPIC_FORMS)}.`}
      back={{ label: "لوحة الإدارة", href: "/admin" }}
    >
      {topics.length > 0 ? (
        <div className="admin-panel">
          {topics.map((topic) => (
            <div key={topic.id} className="admin-row">
              {/* Each topic keeps its own data-driven colour, as its chip does on the public site. */}
              <span
                className="admin-tile"
                style={{
                  color: topic.color,
                  backgroundColor: `color-mix(in srgb, ${topic.color} 14%, transparent)`,
                  borderColor: `color-mix(in srgb, ${topic.color} 22%, transparent)`,
                }}
              >
                <Tag size={19} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-extrabold leading-[1.8]">{topic.title}</p>
                <p className="text-sm text-[var(--ink-soft)]">
                  {formatCount(topic.episodeCount, EPISODE_FORMS)} · {formatCount(topic.seriesCount, SERIES_FORMS)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={Tag} title="لا توجد مواضيع بعد." />
      )}

      <div className="mt-6 sm:mt-8">
        <ComingNextPanel title="إنشاء وتعديل المواضيع">
          يحتاج هذا القسم إلى قاعدة بيانات موصولة (Prisma) ليصبح قابلًا للتعديل من هنا. حاليًا يمكن تعديل بيانات
          المواضيع مباشرة في{" "}
          <code dir="ltr" className="rounded-md bg-white/70 px-1.5 py-0.5 text-[.8rem]">
            src/data/topics.ts
          </code>
          .
        </ComingNextPanel>
      </div>
    </AdminShell>
  );
}
