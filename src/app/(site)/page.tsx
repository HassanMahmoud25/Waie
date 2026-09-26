import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { contentRepository } from "@/lib/repositories";
import { ContentRail } from "@/components/content/content-rail";
import { CollectionCard } from "@/components/content/collection-card";
import { SiteHero, type HeroStatKey } from "@/components/home/site-hero";
import { ContinueWatchingSection } from "@/components/home/continue-watching-section";
import { EpisodeCard } from "@/components/episode/episode-card";
import { Banner } from "@/components/shared/banner";
import { Reveal } from "@/components/shared/reveal";
import { HostsShowcase } from "@/components/host/hosts-showcase";
import { getContinueWatching } from "@/lib/library/continue-watching";
import { EPISODE_FORMS, SERIES_FORMS, TOPIC_FORMS, formatCount, pluralNoun } from "@/lib/utils/format";

export default async function Home() {
  const [latest, popular, series, topics, collections, episodeCount, continueWatching] =
    await Promise.all([
      contentRepository.listLatestEpisodes(8),
      contentRepository.listPopularEpisodes(6),
      contentRepository.listSeries(),
      contentRepository.listTopics(),
      contentRepository.listCollections(),
      contentRepository.countPublishedEpisodes(),
      getContinueWatching(),
    ]);

  const seriesById = new Map(series.map((s) => [s.id, s]));

  // Cover thumbnails for every series (bounded to one row per series, see
  // getSeriesCoverThumbnails) and for each collection's first episode
  // (bounded to one row per collection id) -- never the full episode table.
  const [seriesCoverThumbnails, collectionCoverEpisodes] = await Promise.all([
    contentRepository.getSeriesCoverThumbnails(series.map((s) => s.id)),
    contentRepository.getEpisodesByIds(collections.map((c) => c.episodeIds[0]).filter((id): id is string => Boolean(id))),
  ]);
  const collectionCovers = new Map(
    collectionCoverEpisodes.map((episode) => [episode.id, episode.thumbnailUrl] as const),
  );

  // One consolidated, size-varied "series" showcase instead of a separate
  // full-bleed banner plus a uniform grid -- the biggest series reads as a
  // real feature tile, the rest as a supporting row beside/below it. Filtered
  // to series with real cover art *before* picking the first item, so the
  // series-bento CSS's `:first-child` selector always matches the one
  // actually rendered as the feature tile below.
  const bentoSeries = [...series]
    .sort((a, b) => b.episodeCount - a.episodeCount)
    .map((s) => ({
      series: s,
      coverImageUrl: seriesCoverThumbnails[s.id],
    }))
    .filter(
      (entry): entry is { series: (typeof series)[number]; coverImageUrl: string } => Boolean(entry.coverImageUrl),
    )
    .slice(0, 5);

  const heroStats:
    | { key: HeroStatKey; value: string; label: string }[]
    | undefined =
    episodeCount > 0
      ? [
          { key: "episodes", value: `${episodeCount}`, label: pluralNoun(episodeCount, EPISODE_FORMS) },
          { key: "series", value: `${series.length}`, label: pluralNoun(series.length, SERIES_FORMS) },
          { key: "topics", value: `${topics.length}`, label: pluralNoun(topics.length, TOPIC_FORMS) },
        ]
      : undefined;

  return (
    <main>
      <SiteHero stats={heroStats} latestEpisode={latest[0] ?? null} />

      <ContinueWatchingSection series={series} initialItems={continueWatching} />

      {bentoSeries.length > 0 && (
        <section className="section">
          <div className="container">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="home-eyebrow">سلاسل وعي</span>
                  <h2 className="mt-3 text-xl font-black leading-[1.25] tracking-[-.02em] sm:text-2xl">
                    ابدأ من سلسلة
                  </h2>
                </div>
                <Link href="/series" className="section-link">
                  كل السلاسل <ArrowLeft size={15} />
                </Link>
              </div>

              <div className="mt-6 flex flex-col gap-5 md:hidden">
                {bentoSeries[0] && (
                  <Banner
                    href={`/series/${bentoSeries[0].series.slug}`}
                    imageUrl={bentoSeries[0].coverImageUrl}
                    imageAlt={bentoSeries[0].series.title}
                    eyebrow="السلسلة الأبرز"
                    title={bentoSeries[0].series.title}
                    description={bentoSeries[0].series.description}
                    meta={formatCount(bentoSeries[0].series.episodeCount, EPISODE_FORMS)}
                    ctaLabel="عرض الحلقات"
                    size="feature"
                    sizes="100vw"
                  />
                )}
                {bentoSeries.length > 1 && (
                  <ContentRail className="rail--wide">
                    {bentoSeries.slice(1).map(({ series: s, coverImageUrl }) => (
                      <Banner
                        href={`/series/${s.slug}`}
                        imageUrl={coverImageUrl}
                        imageAlt={s.title}
                        eyebrow="سلسلة"
                        title={s.title}
                        meta={formatCount(s.episodeCount, EPISODE_FORMS)}
                        ctaLabel="عرض الحلقات"
                        size="compact"
                        sizes="88vw"
                        key={s.id}
                      />
                    ))}
                  </ContentRail>
                )}
              </div>

              <div className="series-bento mt-8 hidden md:grid">
                {bentoSeries.map(({ series: s, coverImageUrl }, index) => {
                  const isFirst = index === 0;
                  return (
                    <Banner
                      href={`/series/${s.slug}`}
                      imageUrl={coverImageUrl}
                      imageAlt={s.title}
                      eyebrow={isFirst ? "السلسلة الأبرز" : "سلسلة"}
                      title={s.title}
                      description={isFirst ? s.description : undefined}
                      meta={formatCount(s.episodeCount, EPISODE_FORMS)}
                      ctaLabel="عرض الحلقات"
                      size={isFirst ? "feature" : "compact"}
                      stretch={index === 1}
                      sizes={
                        isFirst
                          ? "(max-width: 1199px) 100vw, 66vw"
                          : "(max-width: 1199px) 50vw, 33vw"
                      }
                      key={s.id}
                    />
                  );
                })}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {bentoSeries.length > 0 && latest.length > 0 && <hr className="section-divider container" />}

      {latest.length > 0 && (
        <section className="section pt-0">
          <div className="container">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="home-eyebrow">الجديد</span>
                  <h2 className="mt-3 text-xl font-black leading-[1.25] tracking-[-.02em] sm:text-2xl">
                    أحدث الحلقات
                  </h2>
                </div>
                <Link href="/search" className="section-link">
                  ابحث في الحلقات <ArrowLeft size={15} />
                </Link>
              </div>

              <ContentRail className="mt-8">
                {latest.map((episode) => (
                  <div className="hover-rise" key={episode.id}>
                    <EpisodeCard
                      episode={episode}
                      series={seriesById.get(episode.seriesId) ?? null}
                    />
                  </div>
                ))}
              </ContentRail>
            </Reveal>
          </div>
        </section>
      )}

      {popular.length > 0 && (
        <section className="section section-tint pt-0">
          <div className="container">
            <Reveal>
              <span className="home-eyebrow">على يوتيوب</span>
              <h2 className="mt-3 text-xl font-black leading-[1.25] tracking-[-.02em] sm:text-2xl">
                الأكثر مشاهدة
              </h2>
              <ContentRail className="rail--wide mt-8">
                {popular.map((episode) => (
                  <div className="hover-rise" key={episode.id}>
                    <EpisodeCard
                      episode={episode}
                      series={seriesById.get(episode.seriesId) ?? null}
                    />
                  </div>
                ))}
              </ContentRail>
            </Reveal>
          </div>
        </section>
      )}

      <HostsShowcase />

      {collections.length > 0 && (
        <section className="section">
          <div className="container">
            <Reveal>
              <span className="home-eyebrow">المزيد من وعي</span>
              <h2 className="mt-3 max-w-xl text-2xl font-black leading-[1.25] tracking-[-.02em] sm:text-3xl">
                حلقات مجمّعة حول فكرة واحدة
              </h2>
            </Reveal>

            <Reveal delayMs={80} className="mt-10">
              <p className="mb-4 text-sm font-bold text-(--ink-soft)">
                المختارات
              </p>
              <ContentRail className="rail--wide md:hidden">
                {collections.map((collection) => {
                  const coverImageUrl = collectionCovers.get(collection.id);
                  if (!coverImageUrl) return null;
                  return (
                    <CollectionCard
                      collection={collection}
                      coverImageUrl={coverImageUrl}
                      key={collection.id}
                    />
                  );
                })}
              </ContentRail>
              <div className="hidden gap-5 md:grid md:grid-cols-2">
                {collections.map((collection) => {
                  const coverImageUrl = collectionCovers.get(collection.id);
                  if (!coverImageUrl) return null;
                  return (
                    <CollectionCard
                      collection={collection}
                      coverImageUrl={coverImageUrl}
                      key={collection.id}
                    />
                  );
                })}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <section className="finale-band section">
        <div className="media absolute inset-0">
          <Image
            src="/brand/hero-stage.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
          <span className="scrim" aria-hidden="true" />
          <span
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(50% 60% at 50% 100%, color-mix(in srgb, var(--accent) 30%, transparent), transparent 70%)",
            }}
            aria-hidden="true"
          />
        </div>
        <div className="container relative pt-10 md:pt-20">
          <Reveal className="glass-dark mx-auto flex max-w-2xl flex-col items-center gap-5 rounded-(--radius-banner) px-8 py-14 text-center text-white shadow-(--shadow-lg) sm:px-14">
            <span className="glass-dark grid size-14 place-items-center rounded-full">
              <BookOpen
                className="text-(--on-brand-accent)"
                size={24}
                aria-hidden="true"
              />
            </span>
            <div>
              <h2 className="text-2xl font-black sm:text-3xl">
                احفظ ما تريد العودة إليه
              </h2>
              <p className="mt-2 text-sm leading-7 text-(--on-brand-soft) sm:text-base">
                احفظ الحلقات التي تريد العودة إليها، ودوّن ملاحظاتك، وأكمل من
                حيث توقفت.
              </p>
            </div>
            <Link href="/library" className="btn btn-glass--solid">
              اذهب إلى مكتبتي <ArrowLeft size={16} />
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
