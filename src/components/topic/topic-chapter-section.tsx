import type { TopicChapter } from "@/lib/utils/topic-chapters";
import { TOPIC_FORMS, formatCount } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { Reveal } from "@/components/shared/reveal";
import { getChapterIcon } from "./topic-icons";
import { TopicLeadTile } from "./topic-lead-tile";
import { TopicTile } from "./topic-tile";

const ORDINALS = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر"];

export function chapterOrdinal(index: number): string {
  return ORDINALS[index] ?? `${index + 1}`;
}

/** Column count for a run of tiles with no lead beside it: whole rows of three when they divide evenly, else two. */
function tileGridClass(count: number): string {
  return count >= 3 && count % 3 === 0 ? "lg:grid-cols-3" : "lg:grid-cols-2";
}

/**
 * One chapter of the topics index: a numbered header, then its topics. With a
 * photographic lead the lead and the tile grid sit side by side (alternating
 * sides down the page); without one the tiles take the full width.
 */
export function TopicChapterSection({
  chapter,
  index,
  tinted = false,
}: {
  chapter: TopicChapter;
  index: number;
  tinted?: boolean;
}) {
  const { lead, topics } = chapter;
  const ChapterIcon = getChapterIcon(chapter.id);
  const isReversed = index % 2 === 1;
  const titleId = `chapter-${chapter.id}-title`;

  return (
    <section
      id={chapter.id}
      aria-labelledby={titleId}
      className={cn("section topics-chapter", tinted && "section-tint pt-12 sm:pt-16")}
    >
      <div className="container">
        <Reveal>
          <header className="topics-chapter__head">
            <span className="topics-chapter__num" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <p className="eyebrow">الباب {chapterOrdinal(index)}</p>
              <h2 id={titleId} className="topics-chapter__title">
                {chapter.title}
              </h2>
              <p className="topics-chapter__blurb">{chapter.blurb}</p>
            </div>
            <span className="chip topics-chapter__count">
              <ChapterIcon size={15} className="text-[var(--accent-strong)]" aria-hidden="true" />
              {formatCount(chapter.topicCount, TOPIC_FORMS)}
            </span>
          </header>
        </Reveal>

        <Reveal delayMs={80}>
          {lead ? (
            <div
              className={cn(
                "grid gap-4 sm:gap-5 lg:items-stretch",
                // The lead is first in the DOM (right, in RTL); reversing moves it to the second track, so the tracks swap too.
                isReversed ? "lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]" : "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]",
              )}
            >
              <TopicLeadTile lead={lead} priority={index === 0} className={isReversed ? "lg:order-2" : undefined} />
              <div
                className={cn(
                  "grid content-start gap-3 sm:grid-cols-2 sm:gap-4 lg:auto-rows-fr",
                  topics.length % 2 === 1 && "sm:[&>:last-child]:col-span-2",
                )}
              >
                {topics.map((topic) => (
                  <TopicTile topic={topic} key={topic.id} />
                ))}
              </div>
            </div>
          ) : (
            <div
              className={cn(
                "grid gap-3 sm:grid-cols-2 sm:gap-4",
                tileGridClass(topics.length),
                topics.length % 2 === 1 && topics.length < 3 && "sm:[&>:last-child]:col-span-2",
              )}
            >
              {topics.map((topic) => (
                <TopicTile topic={topic} key={topic.id} />
              ))}
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
