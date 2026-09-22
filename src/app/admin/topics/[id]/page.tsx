import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { TopicEditor } from "@/components/admin/topic-editor";
import { getTopicForAdmin } from "@/lib/admin/content/topics";
import { requireAdmin } from "@/lib/auth/server";

export const metadata: Metadata = { title: "تعديل موضوع" };

export default async function EditTopicPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const topic = await getTopicForAdmin(id);
  if (!topic) notFound();

  return (
    <AdminShell title={topic.title} description="تعديل بيانات الموضوع." back={{ label: "المواضيع", href: "/admin/topics" }}>
      <TopicEditor topic={topic} />
    </AdminShell>
  );
}
