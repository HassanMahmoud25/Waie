import type { Metadata } from "next";
import Link from "next/link";
import { Search, Tag } from "lucide-react";
import { contentRepository } from "@/lib/repositories";
import { buildTopicChapters } from "@/lib/utils/topic-chapters";
import { EmptyState } from "@/components/content/empty-state";
import { Reveal } from "@/components/shared/reveal";
import { TopicChapterSection } from "@/components/topic/topic-chapter-section";
import { TopicsHero } from "@/components/topic/topics-hero";

export const metadata: Metadata = {
  title: "المواضيع",
  description:
    "كل ما تتحدث عنه حلقات وعي مرتّبًا في أبواب: العبادات والمواسم، والقلب والطريق إلى الله، والأخلاق، وسِيَر الصحابة وقصص الأنبياء، وأسئلة الحياة والمجتمع.",
};

export default async function TopicsPage() {
  const [topics, series, episodeCount] = await Promise.all([
    contentRepository.listTopics(),
    contentRepository.listSeries(),
    contentRepository.countPublishedEpisodes(),
  ]);
  const chapters = buildTopicChapters(topics, series);

  if (chapters.length === 0) {
    return (
      <main className="container py-12 md:py-16">
        <p className="eyebrow-pill w-fit">تصفّح بالموضوع</p>
        <h1 className="mt-4 text-3xl font-black leading-[1.2] tracking-[-.03em] md:text-5xl">المواضيع</h1>
        <div className="mt-10">
          <EmptyState icon={Tag} title="لا توجد مواضيع بعد" description="ستظهر المواضيع هنا عند نشرها." />
        </div>
      </main>
    );
  }

  return (
    <main>
      <TopicsHero chapters={chapters} topicCount={topics.length} episodeCount={episodeCount} />

      <div className="mt-4 sm:mt-6">
        {chapters.map((chapter, index) => (
          <TopicChapterSection chapter={chapter} index={index} tinted={index % 2 === 1} key={chapter.id} />
        ))}
      </div>

      <section className="section pt-0">
        <div className="container">
          <Reveal>
            <div className="topics-finale glass flex flex-col items-start gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:p-10">
              <div className="max-w-xl">
                <p className="eyebrow">لم تجد ما تبحث عنه؟</p>
                <h2 className="mt-2 text-xl font-black leading-[1.3] tracking-[-.02em] sm:text-2xl">
                  ابحث بالكلمة، أو باسم صحابي أو نبي
                </h2>
                <p className="mt-3 leading-8 text-[var(--ink-soft)]">
                  البحث يصل إلى الحلقات والسلاسل والمواضيع معًا، وتجده دائمًا في أعلى الصفحة.
                </p>
              </div>
              <Link href="/search" className="btn btn-ink shrink-0">
                <Search size={16} aria-hidden="true" />
                ابحث في وعي
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
