import type { Collection } from "@/types/collection";
import { Banner } from "@/components/shared/banner";

/** Editorial collection tile — image-driven like every other banner now, so it reads consistently on any section background. */
export function CollectionCard({ collection, coverImageUrl }: { collection: Collection; coverImageUrl: string }) {
  return (
    <Banner
      href={`/collections/${collection.slug}`}
      imageUrl={coverImageUrl}
      imageAlt={collection.title}
      eyebrow="مجموعة تحريرية"
      title={collection.title}
      description={collection.description}
      meta={`${collection.episodeIds.length} حلقات`}
      ctaLabel="ابدأ الرحلة"
      size="compact"
      sizes="(max-width: 768px) 100vw, 50vw"
    />
  );
}
