import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { contentRepository } from "@/lib/repositories";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { SeriesEpisodeList } from "@/components/series/series-episode-list";
import { FollowSeriesButton } from "@/components/series/follow-series-button";
import { EmptyState } from "@/components/content/empty-state";
import { EPISODE_FORMS, formatCount } from "@/lib/utils/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const series = await contentRepository.getSeriesBySlug(slug);
  if (!series) return {};
  return { title: series.title, description: series.description };
}

export default async function SeriesDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const series = await contentRepository.getSeriesBySlug(slug);
  if (!series) notFound();

  // The first batch of episodes (database-limited, see
  // listEpisodesBySeriesCursor) plus the series' full but lightweight
  // "journey" metadata (id/title only, see listSeriesJourneySummaries) --
  // never the complete episode payload in one request. SeriesEpisodeList
  // loads further batches itself as the visitor scrolls.
  const [firstBatch, journeySummaries, coverThumbnails] = await Promise.all([
    contentRepository.listEpisodesBySeriesCursor(series.id, {}),
    contentRepository.listSeriesJourneySummaries(series.id),
    contentRepository.getSeriesCoverThumbnails([series.id]),
  ]);
  const coverImageUrl = series.coverImage ?? coverThumbnails[series.id];
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
        <div className="container absolute inset-x-0 bottom-0 pb-(--mobile-nav-clearance) text-white lg:pb-14">
          <div className="flex sm:items-center gap-3 flex-col sm:flex-row">
            <div className="glass-dark flex w-fit rounded-(--radius-pill) px-4 py-2">
              <Breadcrumbs
                onDark
                items={[
                  { label: "الرئيسية", href: "/" },
                  { label: "السلاسل", href: "/series" },
                  { label: series.title },
                ]}
              />
            </div>
            <p className="eyebrow-pill eyebrow-pill--on-dark w-fit">
              سلسلة وعي
            </p>
          </div>

          <h1 className="mt-4 max-w-2xl text-2xl font-black leading-[1.2] tracking-[-.03em] sm:text-3xl md:text-5xl">
            {series.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--on-brand-soft)] md:text-lg">
            {series.description}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <p className="glass-dark w-fit rounded-[var(--radius-pill)] px-4 py-2 text-sm font-bold text-[var(--on-brand-soft)]">
              {formatCount(series.episodeCount, EPISODE_FORMS)} · ابدأ من البداية
              أو أكمل من حيث توقفت
            </p>
            <FollowSeriesButton seriesId={series.id} />
          </div>
        </div>
      </section>

      <section className="container section">
        {firstBatch.items.length > 0 ? (
          <SeriesEpisodeList
            key={series.id}
            seriesId={series.id}
            initialEpisodes={firstBatch.items}
            initialCursor={firstBatch.nextCursor}
            journeySummaries={journeySummaries}
          />
        ) : (
          <>
            <h2 className="text-2xl font-black tracking-[-.02em] md:text-3xl">
              حلقات السلسلة
            </h2>
            <div className="mt-6">
              <EmptyState title="لا توجد حلقات منشورة في هذه السلسلة بعد" />
            </div>
          </>
        )}
      </section>
    </main>
  );
}
