import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Tag } from "lucide-react";
import { EPISODE_FORMS, SERIES_FORMS, TOPIC_FORMS, formatArabicDate, formatCount } from "@/lib/utils/format";
import { AdminShell } from "@/components/admin/admin-shell";
import { CreateTopicForm } from "@/components/admin/create-topic-form";
import { EmptyState } from "@/components/content/empty-state";
import { requireAdmin } from "@/lib/auth/server";
import { listTopicsForAdmin } from "@/lib/admin/content/topics";

export const metadata: Metadata = { title: "المواضيع" };

export default async function AdminTopicsPage() {
  await requireAdmin();
  const topics = await listTopicsForAdmin();

  return (
    <AdminShell
      title="المواضيع"
      description={`${formatCount(topics.length, TOPIC_FORMS)} — أنشئ موضوعًا جديدًا أو عدّل بياناته.`}
      back={{ label: "لوحة الإدارة", href: "/admin" }}
    >
      <CreateTopicForm />

      <div className="mt-6">
        {topics.length > 0 ? (
          <div className="admin-panel">
            {topics.map((topic) => (
              <div key={topic.id} className="admin-row">
                <span
                  className="admin-tile"
                  style={{
                    color: topic.color ?? "var(--accent)",
                    backgroundColor: `color-mix(in srgb, ${topic.color ?? "var(--accent)"} 14%, transparent)`,
                    borderColor: `color-mix(in srgb, ${topic.color ?? "var(--accent)"} 22%, transparent)`,
                  }}
                >
                  <Tag size={19} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="admin-row__title">{topic.title}</p>
                  <p className="meta mt-1">
                    <span dir="ltr">/{topic.slug}</span>
                    <span>{formatCount(topic._count.episodes, EPISODE_FORMS)}</span>
                    <span>{formatCount(topic._count.series, SERIES_FORMS)}</span>
                    <span>حُدّث {formatArabicDate(topic.updatedAt)}</span>
                  </p>
                </div>
                <Link
                  href={`/admin/topics/${topic.id}`}
                  className="btn btn-secondary shrink-0 max-sm:size-11 max-sm:min-h-0 max-sm:rounded-full max-sm:p-0"
                  aria-label={`تعديل: ${topic.title}`}
                >
                  <Pencil size={15} aria-hidden="true" />
                  <span className="max-sm:hidden">تعديل</span>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={Tag} title="لا توجد مواضيع بعد." description="أضف موضوعًا جديدًا من الحقل أعلاه." />
        )}
      </div>
    </AdminShell>
  );
}
