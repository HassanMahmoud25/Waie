import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { contentRepository } from "@/lib/repositories";
import { siteConfig } from "@/config/site";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { EpisodeThumbnail } from "@/components/content/episode-thumbnail";
import { EpisodeIdentity } from "@/components/episode/episode-identity";
import { EpisodeMeta } from "@/components/episode/episode-meta";
import { EpisodePlayerProvider } from "@/components/episode/player-context";
import { EpisodeMedia } from "@/components/media/episode-media";
import { EpisodeKnowledgeTabs } from "@/components/episode/episode-knowledge-tabs";
import { EpisodeNotes } from "@/components/episode/episode-notes";
import { PrevNextNav } from "@/components/episode/prev-next-nav";
import { RelatedEpisodes } from "@/components/episode/related-episodes";
import { BookmarkButton } from "@/components/shared/bookmark-button";
import { ShareButton } from "@/components/shared/share-button";
import { MarkWatchedButton } from "@/components/shared/mark-watched-button";
import { HostAvatars } from "@/components/host/host-avatars";
import { resolveAudioUrls } from "@/lib/audio/podcast-feed";
import { NO_NEIGHBORS, toMediaItem } from "@/lib/playback/item";
import { toIso8601Duration } from "@/lib/utils/format";
import { resolveEpisodeHosts } from "@/lib/utils/content";

/**
 * Request-memoized (React cache()) so generateMetadata and the page body --
 * which both need the same episode row -- share one DB call per request
 * instead of two. Same pattern as getSessionUser() (lib/auth/server.ts).
 */
const getEpisode = cache((slug: string) => contentRepository.getEpisodeBySlug(slug));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const episode = await getEpisode(slug);
  // Empty, not a throw: the page component's own notFound() (below) is what
  // actually renders the 404 -- this just avoids asserting metadata for
  // content that doesn't exist, and lets root layout's defaults show through
  // for the brief moment before notFound() takes over.
  if (!episode) return {};

  const path = `/episodes/${slug}`;

  return {
    title: episode.title,
    description: episode.description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      // Next.js metadata merges openGraph as a whole object, not per-field --
      // so siteName/locale from the root layout must be restated here or
      // they're silently dropped on every episode page.
      type: "video.other",
      siteName: siteConfig.name,
      locale: "ar_AR",
      title: episode.title,
      description: episode.description,
      url: path,
      images: [{ url: episode.thumbnailUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title: episode.title,
      description: episode.description,
      images: [episode.thumbnailUrl],
    },
  };
}

export default async function EpisodePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const episode = await getEpisode(slug);
  if (!episode) notFound();

  const [recommendations, transcript, mindMap, related, adjacent] = await Promise.all([
    contentRepository.getRecommendationsByEpisode(episode.id),
    contentRepository.getTranscriptByEpisode(episode.id),
    contentRepository.getMindMapByEpisode(episode.id),
    contentRepository.listRelatedEpisodes(episode.id, 3),
    contentRepository.getAdjacentEpisodes(episode.id),
  ]);

  // Only the series this episode and its related picks actually belong to --
  // never the whole table. Depends on `related` above, so it can't join the
  // batch it's derived from; it runs alongside resolveAudioUrls below instead
  // (that one depends on `adjacent` from the same batch), since neither
  // depends on the other.
  const seriesIds = Array.from(new Set([episode.seriesId, ...related.map((e) => e.seriesId)].filter(Boolean)));

  const [seriesRows, audioUrls] = await Promise.all([
    contentRepository.getSeriesByIds(seriesIds),
    // Audio for this episode and its neighbours (for the player's previous/next): the podcast feed's
    // recording of the same episode, unless an editor set an explicit audioUrl.
    resolveAudioUrls([episode, adjacent.previous, adjacent.next].filter((item) => item !== null)),
  ]);

  const seriesById = new Map(seriesRows.map((s) => [s.id, s]));
  const series = seriesById.get(episode.seriesId) ?? null;
  const episodeUrl = `${siteConfig.url}/episodes/${episode.slug}`;
  const episodeHosts = resolveEpisodeHosts(episode);
  const subtitle = series?.title ?? "";
  const toItem = (item: typeof episode) => toMediaItem(item, subtitle, audioUrls.get(item.id) ?? null);
  const mediaItem = toItem(episode);
  const mediaNeighbors = {
    previous: adjacent.previous ? toItem(adjacent.previous) : NO_NEIGHBORS.previous,
    next: adjacent.next ? toItem(adjacent.next) : NO_NEIGHBORS.next,
  };

  // Only emitted when this episode actually has resolved audio (podcast feed
  // match or an editorial override, see resolveAudioUrls) -- never asserted
  // for an episode the podcast doesn't carry.
  const episodeAudio = audioUrls.get(episode.id) ?? null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "VideoObject",
        name: episode.title,
        description: episode.description,
        thumbnailUrl: [episode.thumbnailUrl],
        uploadDate: episode.publishedAt.toISOString(),
        duration: toIso8601Duration(episode.durationSeconds),
        embedUrl: `https://www.youtube-nocookie.com/embed/${episode.youtubeVideoId}`,
      },
      ...(episodeAudio
        ? [
            {
              "@type": "PodcastEpisode",
              url: episodeUrl,
              name: episode.title,
              description: episode.description,
              datePublished: episode.publishedAt.toISOString(),
              ...(episode.episodeNumber !== null ? { episodeNumber: episode.episodeNumber } : {}),
              // The podcast's own cut can run a different length than the video
              // (see resolveAudioUrls) -- episodeAudio.durationSeconds is that
              // audio recording's real duration, not the video's.
              associatedMedia: {
                "@type": "AudioObject",
                contentUrl: episodeAudio.url,
                duration: toIso8601Duration(episodeAudio.durationSeconds),
              },
              partOfSeries: {
                "@type": "PodcastSeries",
                name: siteConfig.name,
                url: siteConfig.url,
              },
            },
          ]
        : []),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "الرئيسية",
            item: siteConfig.url,
          },
          ...(series
            ? [
                {
                  "@type": "ListItem",
                  position: 2,
                  name: series.title,
                  item: `${siteConfig.url}/series/${series.slug}`,
                },
              ]
            : []),
          {
            "@type": "ListItem",
            position: series ? 3 : 2,
            name: episode.title,
            item: episodeUrl,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        <EpisodePlayerProvider item={mediaItem}>
          {/* A softly blurred still of the episode's own thumbnail sits behind the
              title block — a cinematic backdrop instead of a flat canvas, fading
              back to the page background before the player starts. Pulled up by
              the header's own top offset (matching series/[slug]'s hero) so the
              backdrop reaches the true top of the viewport instead of cutting off
              in a hard seam right below the floating nav; the added padding-top
              below compensates so the breadcrumb still lands where it did before. */}
          <section className="relative -mt-[80px] overflow-hidden pt-[6.75rem] sm:-mt-[84px] md:pt-[8.25rem]">
            <div
              className="pointer-events-none absolute inset-0 -z-10"
              aria-hidden="true"
            >
              <EpisodeThumbnail
                src={episode.thumbnailUrl}
                alt=""
                fill
                sizes="100vw"
                className="scale-110 object-cover opacity-25 blur-3xl"
              />
              <div className="absolute inset-0 bg-linear-to-b from-(--canvas)/30 via-[var(--canvas)]/85 to-[var(--canvas)]" />
            </div>

            <div className="container">
              <Breadcrumbs
                items={[
                  { label: "الرئيسية", href: "/" },
                  { label: "السلاسل", href: "/series" },
                  ...(series
                    ? [{ label: series.title, href: `/series/${series.slug}` }]
                    : []),
                  { label: episode.title },
                ]}
              />

              <div className="mt-7 grid gap-8 lg:grid-cols-[1.25fr_.75fr]">
                <div>
                  <EpisodeIdentity
                    episode={episode}
                    series={series}
                    className="eyebrow"
                  />
                  <h1 className="mt-3 max-w-7xl text-xl font-black leading-[1.8] tracking-[-.05em] md:text-2xl">
                    {episode.title}
                  </h1>
                  <EpisodeMeta episode={episode} className="meta mt-5" />

                  {episodeHosts.length > 0 && (
                    <div className="mt-5 flex items-center gap-3">
                      <HostAvatars
                        hosts={episodeHosts}
                        size="md"
                        ringColor="var(--canvas)"
                      />
                      <p className="text-sm font-bold text-[var(--ink-soft)]">
                        {episodeHosts.map((host) => host.name).join(" · ")}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-end gap-2 lg:justify-end">
                  <BookmarkButton episodeId={episode.id} />
                  <ShareButton title={episode.title} url={episodeUrl} />
                  <MarkWatchedButton episodeId={episode.id} />
                </div>
              </div>

              <div className="my-10">
                <EpisodeMedia item={mediaItem} neighbors={mediaNeighbors} key={episode.id} />
              </div>
            </div>
          </section>

          <section className="container pt-10 md:pt-12">
            <EpisodeNotes episodeId={episode.id} durationSeconds={episode.durationSeconds} />
          </section>

          <section className="container section">
            <p className="eyebrow-pill w-fit">تصفّح الحلقات</p>
            <h2 className="mt-3 text-xl font-black leading-[1.8] tracking-[-.03em] md:text-2xl">
              الحلقة السابقة والتالية
            </h2>
            <div className="mt-4">
              <PrevNextNav previous={adjacent.previous} next={adjacent.next} />
            </div>
          </section>

          <section className=" pb-14 md:pb-20">
            <div className="container">
              <p className="eyebrow-pill w-fit">للمراجعة والتوسّع</p>
              <h2 className="mt-3 text-xl font-black leading-[1.8] tracking-[-.03em] md:text-2xl">
                ارجع لما قيل في الحلقة
              </h2>
              <div className="mt-4">
                <EpisodeKnowledgeTabs
                  recommendations={recommendations}
                  transcript={transcript}
                  mindMap={mindMap}
                />
              </div>
            </div>
          </section>
        </EpisodePlayerProvider>

        {related.length > 0 && (
          <section className="section pt-0">
            <div className="container">
              <p className="eyebrow-pill w-fit">للمتابعة</p>
              <h2 className="mt-3 text-xl font-black leading-[1.8] tracking-[-.03em] md:text-2xl">
                حلقات من نفس السلسلة أو الموضوع
              </h2>
              <div className="mt-8">
                <RelatedEpisodes episodes={related} seriesById={seriesById} />
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
