import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { contentRepository } from "@/lib/repositories";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { EpisodeCard } from "@/components/episode/episode-card";
import { EmptyState } from "@/components/content/empty-state";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const collection = await contentRepository.getCollectionBySlug(slug);
  if (!collection) return {};
  return { title: collection.title, description: collection.description };
}

export default async function CollectionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = await contentRepository.getCollectionBySlug(slug);
  if (!collection) notFound();

  const [episodes, series] = await Promise.all([
    contentRepository.getEpisodesByIds(collection.episodeIds),
    contentRepository.listSeries(),
  ]);
  const seriesById = new Map(series.map((s) => [s.id, s]));

  return (
    <main>
      <section className="container pt-6 md:pt-10">
        <Breadcrumbs
          items={[{ label: "الرئيسية", href: "/" }, { label: "المختارات", href: "/collections" }, { label: collection.title }]}
        />
        <p className="eyebrow-pill mt-6 w-fit">مجموعة تحريرية</p>
        <h1 className="mt-4 text-3xl font-black leading-[1.2] tracking-[-.03em] md:text-5xl">{collection.title}</h1>
        <p className="mt-4 max-w-xl text-lg leading-8 text-[var(--ink-soft)]">{collection.description}</p>
      </section>

      <section className="container mt-10 pb-16 md:pb-20">
        {episodes.length > 0 ? (
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {episodes.map((episode) => (
              <EpisodeCard episode={episode} series={seriesById.get(episode.seriesId) ?? null} key={episode.id} />
            ))}
          </div>
        ) : (
          <EmptyState title="لا توجد حلقات في هذه المجموعة بعد" />
        )}
      </section>
    </main>
  );
}
