import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { contentRepository } from "@/lib/repositories";
import { AdminShell } from "@/components/admin/admin-shell";
import { EpisodeEditor } from "@/components/admin/episode-editor";
import { getEpisodeForAdmin } from "@/lib/admin/content/episodes";
import { requireAdmin } from "@/lib/auth/server";

export const metadata: Metadata = { title: "تعديل حلقة" };

export default async function EditEpisodePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const [episode, series, topics] = await Promise.all([
    getEpisodeForAdmin(id),
    contentRepository.listAllSeries(),
    contentRepository.listTopics(),
  ]);
  if (!episode) notFound();

  const title = episode.title ?? episode.youtubeTitle;

  return (
    <AdminShell
      title={title}
      description={episode.episodeNumber !== null ? `وعي ${episode.episodeNumber} — تعديل المحتوى والتصنيف وحالة النشر.` : "تعديل المحتوى والتصنيف وحالة النشر."}
      back={{ label: "الحلقات", href: "/admin/episodes" }}
    >
      <EpisodeEditor episode={episode} series={series} topics={topics} />
    </AdminShell>
  );
}
