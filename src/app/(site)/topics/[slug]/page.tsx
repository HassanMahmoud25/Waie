import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Layers } from "lucide-react";
import { contentRepository } from "@/lib/repositories";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { EmptyState } from "@/components/content/empty-state";
import { EpisodeGridLoader } from "@/components/content/episode-grid-loader";
import { loadMoreTopicEpisodesAction } from "./actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const topic = await contentRepository.getTopicBySlug(slug);
  if (!topic) return {};
  return { title: topic.title, description: topic.description };
}

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = await contentRepository.getTopicBySlug(slug);
  if (!topic) notFound();

  // First batch only (database-limited, see listEpisodesByTopicCursor) --
  // EpisodeGridLoader fetches further batches itself as the visitor scrolls.
  const [firstBatch, series] = await Promise.all([
    contentRepository.listEpisodesByTopicCursor(topic.id, {}),
    contentRepository.listSeries(),
  ]);

  const relatedSeries = series.filter((s) => s.topicId === topic.id);

  return (
    <main className="container py-14">
      <Breadcrumbs
        items={[
          { label: "الرئيسية", href: "/" },
          { label: "المواضيع", href: "/topics" },
          { label: topic.title },
        ]}
      />
      <div className="mt-6 flex items-center gap-5">
        <div>
          <p className="eyebrow-pill w-fit">موضوع</p>
          <h1 className="mt-2 text-3xl font-black leading-[1.2] tracking-[-.03em] md:text-4xl">
            {topic.title}
          </h1>
        </div>
      </div>
      <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--ink-soft)]">
        {topic.description}
      </p>

      {relatedSeries.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-black tracking-[-.02em]">
            سلاسل مرتبطة
          </h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {relatedSeries.map((s) => (
              <Link
                className="chip chip--series group"
                href={`/series/${s.slug}`}
                key={s.id}
              >
                <Layers
                  className="size-4 text-[var(--accent-strong)]"
                  strokeWidth={2.25}
                  aria-hidden="true"
                />
                {s.title}
                <ArrowLeft
                  className="size-3.5 transition-transform duration-200 group-hover:-translate-x-0.5"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-14">
        <h2 className="text-2xl font-black tracking-[-.02em] md:text-3xl">
          حلقات في الموضوع
        </h2>
        {firstBatch.items.length > 0 ? (
          <div className="mt-7">
            <EpisodeGridLoader
              key={topic.id}
              initialEpisodes={firstBatch.items}
              initialCursor={firstBatch.nextCursor}
              fetchMore={loadMoreTopicEpisodesAction.bind(null, topic.id)}
              series={series}
            />
          </div>
        ) : (
          <EmptyState title="سيُضاف محتوى إلى هذا الموضوع قريبًا" />
        )}
      </section>
    </main>
  );
}
