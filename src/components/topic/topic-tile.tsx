import Link from "next/link";
import type { CSSProperties } from "react";
import { ChevronLeft } from "lucide-react";
import type { TopicWithStats } from "@/types/topic";
import { EPISODE_FORMS, formatCount } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { getTopicIcon } from "./topic-icons";

/**
 * The standard topic tile on /topics: a glass card washed with the topic's own
 * colour, its glyph, a two-line description and the episode count. Typographic
 * on purpose -- the photographic tile is reserved for the topics a whole series
 * stands behind (see TopicLeadTile).
 */
export function TopicTile({ topic, className }: { topic: TopicWithStats; className?: string }) {
  const Icon = getTopicIcon(topic.slug);

  return (
    <Link
      href={`/topics/${topic.slug}`}
      className={cn("topic-tile group", className)}
      style={{ "--topic-color": topic.color } as CSSProperties}
    >

      <div className="topic-tile__head">
        <span className="topic-tile__icon">
          <Icon size={21} strokeWidth={1.9} aria-hidden="true" />
        </span>
        <h3 className="topic-tile__title">{topic.title}</h3>
      </div>

      <p className="topic-tile__desc">{topic.description}</p>

      <div className="topic-tile__foot">
        <span className="topic-tile__count">
          <i aria-hidden="true" />
          {topic.episodeCount > 0 ? formatCount(topic.episodeCount, EPISODE_FORMS) : "قريبًا"}
        </span>
        <span className="topic-tile__go" aria-hidden="true">
          <ChevronLeft size={15} strokeWidth={2.4} />
        </span>
      </div>
    </Link>
  );
}
