import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { contentRepository } from "@/lib/repositories";
import { AdminShell } from "@/components/admin/admin-shell";
import { SeriesEditor } from "@/components/admin/series-editor";
import { getSeriesForAdmin } from "@/lib/admin/content/series";
import { requireAdmin } from "@/lib/auth/server";

export const metadata: Metadata = { title: "تعديل سلسلة" };

export default async function EditSeriesPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const [series, topics] = await Promise.all([getSeriesForAdmin(id), contentRepository.listTopics()]);
  if (!series) notFound();

  return (
    <AdminShell
      title={series.title}
      description="تعديل بيانات السلسلة وتصنيفها وحالة نشرها."
      back={{ label: "السلاسل", href: "/admin/series" }}
    >
      <SeriesEditor series={series} topics={topics} />
    </AdminShell>
  );
}
