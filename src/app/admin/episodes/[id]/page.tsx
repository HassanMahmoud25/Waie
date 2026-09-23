import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { contentRepository } from "@/lib/repositories";
import { AdminShell } from "@/components/admin/admin-shell";
import { EpisodeEditor } from "@/components/admin/episode-editor";
import { TranscriptEditor } from "@/components/admin/transcript-editor";
import { MindMapEditor } from "@/components/admin/mind-map-editor";
import { RecommendationEditor } from "@/components/admin/recommendation-editor";
import { getEpisodeForAdmin } from "@/lib/admin/content/episodes";
import { getTranscriptForAdmin } from "@/lib/admin/content/transcripts";
import { getMindMapForAdmin, toMindMapRoot } from "@/lib/admin/content/mind-maps";
import { getRecommendationsForAdmin, toRecommendationDraft } from "@/lib/admin/content/recommendations";
import { requireAdmin } from "@/lib/auth/server";

export const metadata: Metadata = { title: "تعديل حلقة" };

export default async function EditEpisodePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const [episode, series, topics, transcript, mindMap, recommendations] = await Promise.all([
    getEpisodeForAdmin(id),
    contentRepository.listAllSeries(),
    contentRepository.listTopics(),
    getTranscriptForAdmin(id),
    getMindMapForAdmin(id),
    getRecommendationsForAdmin(id),
  ]);
  if (!episode) notFound();

  const title = episode.title ?? episode.youtubeTitle;

  return (
    <AdminShell
      title={title}
      description={episode.episodeNumber !== null ? `وعي ${episode.episodeNumber} — تعديل المحتوى والتصنيف وحالة النشر.` : "تعديل المحتوى والتصنيف وحالة النشر."}
      back={{ label: "الحلقات", href: "/admin/episodes" }}
    >
      <div className="grid gap-6">
        <EpisodeEditor episode={episode} series={series} topics={topics} />
        <TranscriptEditor
          episodeId={episode.id}
          initialText={transcript?.text ?? ""}
          hasExistingTranscript={transcript !== null}
        />
        <MindMapEditor
          episodeId={episode.id}
          initialTitle={mindMap?.title ?? ""}
          initialRoot={mindMap ? toMindMapRoot(mindMap.nodes) : null}
          hasExistingMindMap={mindMap !== null}
        />
        <RecommendationEditor episodeId={episode.id} initialItems={recommendations.map(toRecommendationDraft)} />
      </div>
    </AdminShell>
  );
}
