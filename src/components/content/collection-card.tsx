import type { Collection } from "@/types/collection";
import { Banner } from "@/components/shared/banner";
import { EPISODE_FORMS, formatCount } from "@/lib/utils/format";

/** Editorial collection tile — image-driven like every other banner now, so it reads consistently on any section background. */
export function CollectionCard({ collection, coverImageUrl }: { collection: Collection; coverImageUrl: string }) {
  return (
    <Banner
      href={`/collections/${collection.slug}`}
      imageUrl={coverImageUrl}
      imageAlt={collection.title}
      eyebrow="من المختارات"
      title={collection.title}
      description={collection.description}
      meta={formatCount(collection.episodeIds.length, EPISODE_FORMS)}
      ctaLabel="عرض الحلقات"
      size="compact"
      sizes="(max-width: 768px) 100vw, 50vw"
    />
  );
}
