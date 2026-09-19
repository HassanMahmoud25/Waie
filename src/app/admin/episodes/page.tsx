import type { Metadata } from "next";
import { Headphones } from "lucide-react";
import { contentRepository } from "@/lib/repositories";
import { EPISODE_FORMS, formatCount } from "@/lib/utils/format";
import { AdminShell } from "@/components/admin/admin-shell";
import { EpisodeRow } from "@/components/admin/episode-row";
import { EmptyState } from "@/components/content/empty-state";

export const metadata: Metadata = { title: "الحلقات" };

export default async function AdminEpisodesPage() {
  const [episodes, series] = await Promise.all([
    contentRepository.listAllEpisodes(),
    contentRepository.listSeries(),
  ]);
  const seriesById = new Map(series.map((s) => [s.id, s]));

  return (
    <AdminShell
      title="الحلقات"
      description={`${formatCount(episodes.length, EPISODE_FORMS)} — عدّل العنوان والوصف والحالة، أو أضف حلقة جديدة من لوحة الإدارة.`}
      back={{ label: "لوحة الإدارة", href: "/admin" }}
    >
      {episodes.length > 0 ? (
        <div className="admin-panel">
          {episodes.map((episode) => (
            <EpisodeRow
              episode={episode}
              seriesTitle={seriesById.get(episode.seriesId)?.title ?? "بلا سلسلة"}
              showDuration
              key={episode.id}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Headphones}
          title="لا توجد حلقات بعد."
          description="استورد قناة وعي من صفحة مزامنة يوتيوب لتظهر الحلقات هنا."
        />
      )}
    </AdminShell>
  );
}
