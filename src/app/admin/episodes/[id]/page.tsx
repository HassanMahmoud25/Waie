import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { contentRepository } from "@/lib/repositories";
import { AdminShell } from "@/components/admin/admin-shell";
import { EpisodeEditForm } from "@/components/admin/episode-edit-form";

export const metadata: Metadata = { title: "تعديل حلقة" };

export default async function EditEpisodePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const episode = await contentRepository.getEpisodeById(id);
  if (!episode) notFound();

  return (
    <AdminShell
      title={episode.title}
      description={episode.episodeNumber !== null ? `وعي ${episode.episodeNumber} — تعديل العنوان والوصف والحالة.` : "تعديل العنوان والوصف والحالة."}
      back={{ label: "الحلقات", href: "/admin/episodes" }}
    >
      <EpisodeEditForm episode={episode} />
    </AdminShell>
  );
}
