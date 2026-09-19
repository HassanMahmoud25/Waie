import Link from "next/link";
import type { CSSProperties } from "react";
import { ChevronLeft, Headphones, LayoutGrid, Tag, type LucideIcon } from "lucide-react";
import type { TopicChapter } from "@/lib/utils/topic-chapters";
import { pluralNoun, TOPIC_FORMS, EPISODE_FORMS } from "@/lib/utils/format";
import { chapterOrdinal } from "./topic-chapter-section";

const CHAPTER_FORMS = { one: "باب واحد", two: "بابان", few: "أبواب", many: "باب" };

type HeroStat = { key: string; value: number; label: string; icon: LucideIcon };

/**
 * The /topics opener: a plain-canvas page header like /series and /library
 * (eyebrow pill, h1, intro), plus what makes this page different -- the
 * chapter index. It's the page's table of contents: a panel of numbered rows
 * from `lg`, a swipeable strip of pills on phones. Each entry jumps to its
 * chapter below.
 */
export function TopicsHero({
  chapters,
  topicCount,
  episodeCount,
}: {
  chapters: TopicChapter[];
  topicCount: number;
  episodeCount: number;
}) {
  const stats: HeroStat[] = [
    { key: "topics", value: topicCount, label: pluralNoun(topicCount, TOPIC_FORMS), icon: Tag },
    { key: "episodes", value: episodeCount, label: pluralNoun(episodeCount, EPISODE_FORMS), icon: Headphones },
    { key: "chapters", value: chapters.length, label: pluralNoun(chapters.length, CHAPTER_FORMS), icon: LayoutGrid },
  ];

  return (
    <header className="container pb-2 pt-12 md:pt-16">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-9 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)] lg:items-center lg:gap-16">
        <div>
          <p className="eyebrow-pill hero-in w-fit">تصفّح بالموضوع</p>
          <h1
            className="hero-in mt-4 text-3xl font-black leading-[1.2] tracking-[-.03em] md:text-5xl"
            style={{ "--hero-delay": ".08s" } as CSSProperties}
          >
            ما الذي يشغلك اليوم؟
          </h1>
          <p
            className="hero-in mt-4 max-w-xl text-lg leading-8 text-[var(--ink-soft)]"
            style={{ "--hero-delay": ".16s" } as CSSProperties}
          >
            مواضيع وعي مرتّبة في أبواب، من العبادات والأخلاق إلى قصص الأنبياء وأسئلة الواقع. اختر ما يشغلك، وابدأ من
            أول حلقة.
          </p>

          <ul className="topics-stats glass hero-in mt-8" style={{ "--hero-delay": ".24s" } as CSSProperties}>
            {stats.map(({ key, value, label, icon: Icon }) => (
              <li className="topics-stat" key={key}>
                <Icon className="topics-stat__icon" size={18} aria-hidden="true" />
                <div>
                  <b>{value}</b>
                  <span>{label}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <nav
          className="topics-toc hero-in"
          style={{ "--hero-delay": ".2s" } as CSSProperties}
          aria-label="أبواب المواضيع"
        >
          <p className="eyebrow topics-toc__heading">أبواب المواضيع</p>
          <ol className="topics-toc__list">
            {chapters.map((chapter, index) => (
              <li key={chapter.id} className="contents">
                <Link href={`#${chapter.id}`} className="topics-toc__link">
                  <span className="topics-toc__num" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="topics-toc__title">
                    <span className="sr-only">الباب {chapterOrdinal(index)}: </span>
                    {chapter.title}
                  </span>
                  <span className="topics-toc__leader" aria-hidden="true" />
                  <span className="topics-toc__detail">
                    <span className="topics-dots" aria-hidden="true">
                      {[...chapter.topics, ...(chapter.lead ? [chapter.lead.topic] : [])]
                        .slice(0, 5)
                        .map((topic) => (
                          <i key={topic.id} style={{ backgroundColor: topic.color }} />
                        ))}
                    </span>
                    {chapter.topicCount}
                    <ChevronLeft className="topics-toc__arrow" size={16} strokeWidth={2.2} aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </header>
  );
}
