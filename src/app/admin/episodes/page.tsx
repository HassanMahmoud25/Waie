import type { Metadata } from "next";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { contentRepository } from "@/lib/repositories";
import { AdminShell } from "@/components/admin/admin-shell";
import { StatusBadge } from "@/components/admin/status-badge";
import { Tag } from "@/components/ui/tag";
import { formatArabicDate, formatDuration } from "@/lib/utils/format";

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
      description={`${episodes.length} حلقة — عدّل العنوان والوصف والحالة، أو أضف حلقة جديدة من لوحة الإدارة.`}
      back={{ label: "لوحة الإدارة", href: "/admin" }}
    >
      <div className="border-t border-[var(--line)]">
        {episodes.map((episode) => (
          <div
            key={episode.id}
            className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] py-4"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={episode.status} />
                {episode.featured && <Tag className="py-1 text-xs">مميّزة</Tag>}
              </div>
              <b className="mt-2 block truncate text-lg">{episode.title}</b>
              <p className="meta mt-1">
                {episode.episodeNumber !== null && <span>وعي {episode.episodeNumber}</span>}
                <span>{seriesById.get(episode.seriesId)?.title ?? "بلا سلسلة"}</span>
                <span>{formatDuration(episode.durationSeconds)}</span>
                <span>{formatArabicDate(episode.publishedAt)}</span>
              </p>
            </div>
            <Link
              href={`/admin/episodes/${episode.id}`}
              className="btn btn-secondary shrink-0"
            >
              <Pencil size={15} aria-hidden="true" />
              تعديل
            </Link>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
