import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Headphones, SearchX } from "lucide-react";
import { contentRepository } from "@/lib/repositories";
import { EPISODE_FORMS, formatCount } from "@/lib/utils/format";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminSearchFieldSkeleton } from "@/components/admin/admin-skeletons";
import { AdminEpisodeListLoader } from "@/components/admin/admin-episode-list-loader";
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

  // Tab counts come from one GROUP BY (never listAllEpisodes().length), and
  // listAllSeries() mirrors listAllEpisodes()'s "admin sees every status"
  // behavior so a draft series' title still resolves here instead of
  // showing "بلا سلسلة". The actual rendered list is the first cursor-
  // paginated batch matching the active tab/query -- AdminEpisodeListLoader
  // fetches further batches itself as the admin clicks "تحميل المزيد", so
  // this never loads every matching episode into memory at once.
  const [statusCounts, series, firstBatch] = await Promise.all([
    contentRepository.countEpisodesByStatus(),
    contentRepository.listAllSeries(),
    contentRepository.searchAdminEpisodesCursor({ status: activeTab.status, query }),
  ]);

  return (
    <AdminShell
      title="الحلقات"
      description={`${formatCount(statusCounts.total, EPISODE_FORMS)} — عدّل المحتوى أو انشر/ألغِ نشر أي حلقة، أو أضف حلقة جديدة من رابط يوتيوب.`}
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
          const count = tab.status ? statusCounts.byStatus[tab.status] : statusCounts.total;
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
        {firstBatch.items.length > 0 ? (
          <AdminEpisodeListLoader
            key={`${activeTab.key}-${query}`}
            initialEpisodes={firstBatch.items}
            initialCursor={firstBatch.nextCursor}
            status={activeTab.status}
            query={query}
            series={series}
          />
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
