import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { contentRepository } from "@/lib/repositories";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { SeriesEpisodeList } from "@/components/series/series-episode-list";
import { EmptyState } from "@/components/content/empty-state";
import { findSeriesCoverEpisode } from "@/lib/utils/content";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const series = await contentRepository.getSeriesBySlug(slug);
  if (!series) return {};
  return { title: series.title, description: series.description };
}

export default async function SeriesDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const series = await contentRepository.getSeriesBySlug(slug);
  if (!series) notFound();

  const [episodes, allEpisodes] = await Promise.all([
    contentRepository.listEpisodesBySeries(series.id),
    contentRepository.listEpisodes(),
  ]);
  const coverImageUrl = series.coverImage ?? findSeriesCoverEpisode(allEpisodes, series.id)?.thumbnailUrl;
  const coverImageMobileUrl = series.coverImageMobile ?? coverImageUrl;

  return (
    <main>
      <section className="relative -mt-[80px] overflow-hidden sm:-mt-[84px]">
        <div className="relative h-[100svh] w-full">
          {coverImageMobileUrl && (
            <Image
              src={coverImageMobileUrl}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover md:hidden"
            />
          )}
          {coverImageUrl && (
            <Image
              src={coverImageUrl}
              alt=""
              fill
              priority
              sizes="100vw"
              className="hidden object-cover md:block"
            />
          )}
          <span className="scrim" aria-hidden="true" />
        </div>
        <div className="container absolute inset-x-0 bottom-0 pb-[var(--mobile-nav-clearance)] text-white lg:pb-14">
          <div className="glass-dark inline-flex w-fit rounded-[var(--radius-pill)] px-4 py-2">
            <Breadcrumbs
              onDark
              items={[{ label: "الرئيسية", href: "/" }, { label: "السلاسل", href: "/series" }, { label: series.title }]}
            />
          </div>
          <p className="eyebrow-pill eyebrow-pill--on-dark mt-6 w-fit">سلسلة وعي</p>
          <h1 className="mt-4 max-w-2xl text-2xl font-black leading-[1.2] tracking-[-.03em] sm:text-3xl md:text-5xl">{series.title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--on-brand-soft)] md:text-lg">{series.description}</p>
          <p className="glass-dark mt-6 w-fit rounded-[var(--radius-pill)] px-4 py-2 text-sm font-bold text-[var(--on-brand-soft)]">
            {series.episodeCount} حلقة · ابدأ من البداية أو أكمل من حيث توقفت
          </p>
        </div>
      </section>

      <section className="container py-14 md:py-20">
        {episodes.length > 0 ? (
          <SeriesEpisodeList episodes={episodes} />
        ) : (
          <>
            <h2 className="text-2xl font-black tracking-[-.02em] md:text-3xl">حلقات السلسلة</h2>
            <div className="mt-6">
              <EmptyState title="لا توجد حلقات منشورة في هذه السلسلة بعد" />
            </div>
          </>
        )}
      </section>
    </main>
  );
}
