import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Video } from "lucide-react";
import { contentRepository } from "@/lib/repositories";
import { AdminShell } from "@/components/admin/admin-shell";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { formatArabicDate } from "@/lib/utils/format";

export const metadata: Metadata = { title: "لوحة الإدارة" };

export default async function AdminPage() {
  const [episodes, series, topics, collections] = await Promise.all([
    contentRepository.listAllEpisodes(),
    contentRepository.listSeries(),
    contentRepository.listTopics(),
    contentRepository.listCollections(),
  ]);

  const sections = [
    { label: "الحلقات", count: episodes.length, href: "/admin/episodes" },
    { label: "السلاسل", count: series.length, href: "/admin/series" },
    { label: "الموضوعات", count: topics.length, href: "/admin/topics" },
    { label: "المختارات", count: collections.length, href: "/admin/collections" },
  ];

  const recentEpisodes = episodes.slice(0, 5);

  return (
    <AdminShell title="لوحة وعي" description="إدارة الحلقات والسلاسل والموضوعات والمختارات.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map((section) => (
          <Link
            href={section.href}
            key={section.label}
            className="border border-[var(--line)] p-5 transition-colors hover:border-[var(--brand)]"
          >
            <p className="text-sm text-[var(--ink-soft)]">{section.label}</p>
            <b className="mt-3 block text-3xl">{section.count}</b>
            <span className="mt-5 block text-sm font-bold text-[var(--brand)]">إدارة ←</span>
          </Link>
        ))}
      </div>

      <section className="mt-8 border border-[var(--line)] p-6">
        <div className="flex items-start gap-4">
          <Video className="mt-1 shrink-0 text-[var(--brand)]" size={22} aria-hidden="true" />
          <div>
            <p className="eyebrow">خطوة سريعة</p>
            <h2 className="mt-1 text-xl font-black">أضف حلقة من يوتيوب</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--ink-soft)]">
              الصق الرابط، اجلب بيانات الفيديو، ثم اختر السلسلة والموضوعات قبل النشر.
            </p>
          </div>
        </div>
        <form className="mt-5 flex flex-col gap-3 sm:flex-row">
          <label htmlFor="youtube-url" className="sr-only">
            رابط يوتيوب
          </label>
          <input
            id="youtube-url"
            className="flex-1 border border-[var(--line)] bg-white px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
            placeholder="https://youtube.com/watch?v=..."
          />
          <Button href="/admin/sync/youtube" variant="primary">
            جلب بيانات الفيديو
          </Button>
        </form>
      </section>

      <section className="mt-6 border border-[var(--line)]">
        <div className="flex items-center justify-between p-5">
          <h2 className="font-black">آخر الحلقات</h2>
          <Link className="text-sm font-bold text-[var(--brand)]" href="/admin/episodes">
            إدارة الحلقات ←
          </Link>
        </div>
        <div className="border-t border-[var(--line)]">
          {recentEpisodes.map((episode) => (
            <div
              key={episode.id}
              className="flex items-center justify-between gap-4 border-b border-[var(--line)] px-5 py-4 last:border-0"
            >
              <div className="min-w-0">
                <b className="block truncate">{episode.title}</b>
                <p className="meta mt-1">
                  {episode.episodeNumber !== null && <span>وعي {episode.episodeNumber}</span>}
                  <StatusBadge status={episode.status} />
                  <span>{formatArabicDate(episode.publishedAt)}</span>
                </p>
              </div>
              <Link href={`/admin/episodes/${episode.id}`} className="btn btn-secondary shrink-0">
                <Pencil size={15} aria-hidden="true" />
                تعديل
              </Link>
            </div>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
