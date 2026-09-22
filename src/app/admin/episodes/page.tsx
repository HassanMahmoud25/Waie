import type { Metadata } from "next";
import Link from "next/link";
import { Headphones } from "lucide-react";
import { contentRepository } from "@/lib/repositories";
import { EPISODE_FORMS, formatCount } from "@/lib/utils/format";
import { AdminShell } from "@/components/admin/admin-shell";
import { EpisodeRow } from "@/components/admin/episode-row";
import { CreateEpisodeForm } from "@/components/admin/create-episode-form";
import { EmptyState } from "@/components/content/empty-state";
import { requireAdmin } from "@/lib/auth/server";
import { cn } from "@/lib/utils/cn";
import type { ContentStatus } from "@/types/content-status";

export const metadata: Metadata = { title: "الحلقات" };

const statusTabs: { key: string; label: string; status: ContentStatus | null }[] = [
  { key: "all", label: "الكل", status: null },
  { key: "published", label: "منشورة", status: "PUBLISHED" },
  { key: "draft", label: "مسودات", status: "DRAFT" },
  { key: "archived", label: "مؤرشفة", status: "ARCHIVED" },
];

export default async function AdminEpisodesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status: statusParam } = await searchParams;
  const activeTab = statusTabs.find((tab) => tab.key === statusParam) ?? statusTabs[0];

  // Admin-only, unfiltered data paths: listAllEpisodes() returns every status
  // (not the public listEpisodes()), and listAllSeries() mirrors it so a
  // draft series' title still resolves here instead of showing "بلا سلسلة".
  const [allEpisodes, series] = await Promise.all([
    contentRepository.listAllEpisodes(),
    contentRepository.listAllSeries(),
  ]);
  const seriesById = new Map(series.map((s) => [s.id, s]));
  const episodes = activeTab.status
    ? allEpisodes.filter((episode) => episode.status === activeTab.status)
    : allEpisodes;

  return (
    <AdminShell
      title="الحلقات"
      description={`${formatCount(allEpisodes.length, EPISODE_FORMS)} — عدّل المحتوى أو انشر/ألغِ نشر أي حلقة، أو أضف حلقة جديدة من رابط يوتيوب.`}
      back={{ label: "لوحة الإدارة", href: "/admin" }}
    >
      <CreateEpisodeForm />

      <nav className="admin-tabs mt-6" aria-label="تصفية حسب الحالة">
        {statusTabs.map((tab) => {
          const count = tab.status ? allEpisodes.filter((episode) => episode.status === tab.status).length : allEpisodes.length;
          return (
            <Link
              key={tab.key}
              href={tab.key === "all" ? "/admin/episodes" : `/admin/episodes?status=${tab.key}`}
              aria-current={tab.key === activeTab.key ? "page" : undefined}
              className={cn("admin-tab")}
            >
              {tab.label}
              <span className="opacity-70">{count}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4">
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
            title="لا توجد حلقات هنا."
            description={
              activeTab.status
                ? "لا توجد حلقات بهذه الحالة حاليًا."
                : "أضف حلقة جديدة من الحقل أعلاه، أو استورد قناة وعي من صفحة مزامنة يوتيوب."
            }
          />
        )}
      </div>
    </AdminShell>
  );
}
