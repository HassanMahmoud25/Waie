import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Headphones } from "lucide-react";
import { contentRepository } from "@/lib/repositories";
import { AdminShell } from "@/components/admin/admin-shell";
import { adminNavItems } from "@/components/admin/admin-nav";
import { EpisodeRow } from "@/components/admin/episode-row";
import { EmptyState } from "@/components/content/empty-state";
import { YoutubeGlyph } from "@/components/icons/platform-glyphs";
import { requireAdmin } from "@/lib/auth/server";

export const metadata: Metadata = { title: "لوحة الإدارة" };

const iconFor = (href: string) => adminNavItems.find((item) => item.href === href)!.icon;

export default async function AdminPage() {
  await requireAdmin();
  const [episodes, series, topics, collections] = await Promise.all([
    contentRepository.listAllEpisodes(),
    contentRepository.listAllSeries(),
    contentRepository.listTopics(),
    contentRepository.listAllCollections(),
  ]);

  const sections = [
    { label: "الحلقات", count: episodes.length, href: "/admin/episodes" },
    { label: "السلاسل", count: series.length, href: "/admin/series" },
    { label: "المواضيع", count: topics.length, href: "/admin/topics" },
    { label: "المختارات", count: collections.length, href: "/admin/collections" },
  ];

  const recentEpisodes = episodes.slice(0, 5);

  return (
    <AdminShell title="لوحة وعي" description="إدارة الحلقات والسلاسل والمواضيع والمختارات.">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {sections.map((section) => {
          const Icon = iconFor(section.href);
          return (
            <Link href={section.href} key={section.label} className="admin-panel admin-stat">
              <span className="flex items-center justify-between">
                <span className="admin-tile">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <span className="section-link">
                  إدارة <ArrowLeft size={14} aria-hidden="true" />
                </span>
              </span>
              <span>
                <span className={`admin-stat__value ${section.count === 0 ? "admin-stat__value--zero" : ""}`}>
                  {section.count}
                </span>
                <span className="mt-1.5 block text-sm font-bold text-[var(--ink-soft)]">{section.label}</span>
              </span>
            </Link>
          );
        })}
      </div>

      <section className="admin-quickadd mt-6 sm:mt-8" aria-labelledby="quick-add-title">
        <Image
          src="/brand/hero-stage.jpg"
          alt=""
          fill
          sizes="(min-width: 1024px) 1080px, 100vw"
          className="admin-quickadd__photo"
        />
        <div className="admin-quickadd__scrim" aria-hidden="true" />

        <div className="max-w-xl">
          <p className="eyebrow-pill eyebrow-pill--on-dark w-fit">
            <YoutubeGlyph size={15} />
            خطوة سريعة
          </p>
          <h2 id="quick-add-title" className="mt-4 text-xl font-black leading-[1.5] tracking-[-.02em] sm:text-2xl">
            أضف حلقة من يوتيوب
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--on-brand-soft)]">
            الصق الرابط، اجلب بيانات الفيديو، ثم اختر السلسلة والمواضيع قبل النشر.
          </p>
        </div>

        <form className="mt-6 flex flex-col gap-3 sm:flex-row">
          <label htmlFor="youtube-url" className="sr-only">
            رابط يوتيوب
          </label>
          <input
            id="youtube-url"
            dir="ltr"
            inputMode="url"
            className="admin-field admin-field--on-dark flex-1"
            placeholder="https://youtube.com/watch?v=..."
          />
          <Link href="/admin/sync/youtube" className="btn btn-on-media">
            جلب بيانات الفيديو
          </Link>
        </form>
      </section>

      <section className="admin-panel mt-6 sm:mt-8" aria-labelledby="recent-episodes-title">
        <div className="admin-panel__head">
          <h2 id="recent-episodes-title" className="admin-panel__title">
            آخر الحلقات
          </h2>
          <Link className="section-link" href="/admin/episodes">
            إدارة الحلقات <ArrowLeft size={15} aria-hidden="true" />
          </Link>
        </div>
        {recentEpisodes.length > 0 ? (
          <div>
            {recentEpisodes.map((episode) => (
              <EpisodeRow episode={episode} key={episode.id} />
            ))}
          </div>
        ) : (
          <div className="p-4">
            <EmptyState
              icon={Headphones}
              title="لا توجد حلقات بعد."
              description="استورد قناة وعي من صفحة مزامنة يوتيوب لتظهر الحلقات هنا."
            />
          </div>
        )}
      </section>
    </AdminShell>
  );
}
