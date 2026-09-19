import type { SeriesWithStats } from "@/types/series";
import type { TopicWithStats } from "@/types/topic";
import { fallbackTopicChapter, topicChapters } from "@/data/topic-chapters";

export type TopicChapter = {
  id: string;
  title: string;
  blurb: string;
  /** The chapter's photographic lead: its first topic that a series with cover art stands behind. */
  lead: { topic: TopicWithStats; series: SeriesWithStats; coverImage: string; coverImageMobile: string } | null;
  /** Every other topic, in the chapter's reading order. */
  topics: TopicWithStats[];
  topicCount: number;
};

/**
 * Resolves data/topic-chapters.ts against the live topic list. Slugs that no
 * longer exist are skipped, and any topic no chapter names is gathered into a
 * closing chapter, so adding a topic in data/topics.ts never makes it vanish
 * from this page.
 */
export function buildTopicChapters(topics: TopicWithStats[], series: SeriesWithStats[]): TopicChapter[] {
  const topicsBySlug = new Map(topics.map((topic) => [topic.slug, topic]));
  const placed = new Set<string>();

  const definitions = topicChapters.map((chapter) => ({
    id: chapter.id,
    title: chapter.title,
    blurb: chapter.blurb,
    members: chapter.topicSlugs
      .map((slug) => topicsBySlug.get(slug))
      .filter((topic): topic is TopicWithStats => Boolean(topic)),
  }));
  definitions.forEach((chapter) => chapter.members.forEach((topic) => placed.add(topic.id)));

  const strays = topics.filter((topic) => !placed.has(topic.id));
  if (strays.length > 0) definitions.push({ ...fallbackTopicChapter, members: strays });

  return definitions
    .filter((chapter) => chapter.members.length > 0)
    .map(({ members, ...chapter }) => {
      const leadTopic = members.find((topic) =>
        series.some((s) => s.topicId === topic.id && s.status === "PUBLISHED" && s.coverImage),
      );
      const leadSeries = leadTopic ? series.find((s) => s.topicId === leadTopic.id && s.coverImage) : undefined;

      return {
        ...chapter,
        lead:
          leadTopic && leadSeries?.coverImage
            ? {
                topic: leadTopic,
                series: leadSeries,
                coverImage: leadSeries.coverImage,
                coverImageMobile: leadSeries.coverImageMobile ?? leadSeries.coverImage,
              }
            : null,
        topics: members.filter((topic) => topic.id !== leadTopic?.id),
        topicCount: members.length,
      };
    });
}
