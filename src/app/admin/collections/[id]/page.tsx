import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { contentRepository } from "@/lib/repositories";
import { AdminShell } from "@/components/admin/admin-shell";
import { CollectionEditor } from "@/components/admin/collection-editor";
import { getCollectionForAdmin } from "@/lib/admin/content/collections";
import { requireAdmin } from "@/lib/auth/server";

export const metadata: Metadata = { title: "تعديل مجموعة" };

export default async function EditCollectionPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const [collection, allEpisodes, series] = await Promise.all([
    getCollectionForAdmin(id),
    contentRepository.listAllEpisodes(),
    contentRepository.listAllSeries(),
  ]);
  if (!collection) notFound();

  return (
    <AdminShell
      title={collection.title}
      description="تعديل بيانات المجموعة، حلقاتها وترتيبها، وحالة نشرها."
      back={{ label: "المختارات", href: "/admin/collections" }}
    >
      <CollectionEditor collection={collection} allEpisodes={allEpisodes} series={series} />
    </AdminShell>
  );
}
