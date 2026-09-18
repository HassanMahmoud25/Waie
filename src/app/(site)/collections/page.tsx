import type { Metadata } from "next";
import { contentRepository } from "@/lib/repositories";
import { CollectionCard } from "@/components/content/collection-card";

export const metadata: Metadata = {
  title: "المختارات",
  description: "مجموعات تحريرية منظمة حول فكرة واحدة.",
};

export default async function CollectionsPage() {
  const collections = await contentRepository.listCollections();
  const covers = await Promise.all(
    collections.map(async (collection) => {
      const [firstEpisode] = await contentRepository.getEpisodesByIds(collection.episodeIds.slice(0, 1));
      return firstEpisode?.thumbnailUrl;
    }),
  );

  return (
    <main className="container py-12 md:py-16">
      <p className="eyebrow-pill w-fit">اختيارات منظمة</p>
      <h1 className="mt-4 text-3xl font-black leading-[1.2] tracking-[-.03em] md:text-5xl">المختارات</h1>
      <p className="mt-4 max-w-xl text-lg leading-8 text-(--ink-soft)">
        مجموعات تحريرية منظمة حول فكرة واحدة، تختصر عليك رحلة البحث.
      </p>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {collections.map((collection, index) => {
          const coverImageUrl = covers[index];
          if (!coverImageUrl) return null;
          return <CollectionCard collection={collection} coverImageUrl={coverImageUrl} key={collection.id} />;
        })}
      </div>
    </main>
  );
}
