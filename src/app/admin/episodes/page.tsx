import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Headphones, SearchX } from "lucide-react";
import { contentRepository } from "@/lib/repositories";
import { EPISODE_FORMS, formatCount } from "@/lib/utils/format";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminSearchFieldSkeleton } from "@/components/admin/admin-skeletons";
import { EpisodeRow } from "@/components/admin/episode-row";
import { CreateEpisodeForm } from "@/components/admin/create-episode-form";
import { EpisodeSearchInput } from "@/components/admin/episode-search-input";
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
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requireAdmin();
  const { status: statusParam, q } = await searchParams;
  const activeTab = statusTabs.find((tab) => tab.key === statusParam) ?? statusTabs[0];
  const query = q?.trim() ?? "";

  // Admin-only, unfiltered data paths: listAllEpisodes() returns every status
  // (not the public listEpisodes()), and listAllSeries() mirrors it so a
  // draft series' title still resolves here instead of showing "بلا سلسلة".
  // allEpisodes stays unfiltered (by status or query) purely to compute the
  // tab counts below -- the actual rendered list comes from the DB-side
  // searchAdminEpisodes() so filtering scales past an in-memory array.
  const [allEpisodes, series, episodes] = await Promise.all([
    contentRepository.listAllEpisodes(),
    contentRepository.listAllSeries(),
    contentRepository.searchAdminEpisodes({ status: activeTab.status, query }),
  ]);
  const seriesById = new Map(series.map((s) => [s.id, s]));

  return (
    <AdminShell
      title="الحلقات"
      description={`${formatCount(allEpisodes.length, EPISODE_FORMS)} — عدّل المحتوى أو انشر/ألغِ نشر أي حلقة، أو أضف حلقة جديدة من رابط يوتيوب.`}
      back={{ label: "لوحة الإدارة", href: "/admin" }}
    >
      <CreateEpisodeForm />

      <div className="mt-6">
        <Suspense fallback={<AdminSearchFieldSkeleton />}>
          <EpisodeSearchInput defaultValue={query} />
        </Suspense>
      </div>

      <nav className="admin-tabs mt-4" aria-label="تصفية حسب الحالة">
        {statusTabs.map((tab) => {
          const count = tab.status ? allEpisodes.filter((episode) => episode.status === tab.status).length : allEpisodes.length;
          const href = new URLSearchParams();
          if (tab.key !== "all") href.set("status", tab.key);
          if (query) href.set("q", query);
          const qs = href.toString();
          return (
            <Link
              key={tab.key}
              href={qs ? `/admin/episodes?${qs}` : "/admin/episodes"}
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
        ) : query ? (
          <EmptyState
            icon={SearchX}
            title="لا توجد نتائج."
            description={`لا توجد حلقات تطابق "${query}"${activeTab.status ? ` ضمن ${activeTab.label}` : ""}.`}
          />
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
