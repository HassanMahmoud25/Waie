import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Layers } from "lucide-react";
import type { TopicChapter } from "@/lib/utils/topic-chapters";
import { EPISODE_FORMS, formatCount } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { getTopicIcon } from "./topic-icons";

/**
 * A chapter's photographic anchor: the topic a full series stands behind,
 * carried by that series' own cover art the way the /series tiles are. Wide
 * crop on phones and tablets, the series' portrait crop once it sits beside
 * the tile grid (lg+), where it stretches to the grid's height.
 */
export function TopicLeadTile({
  lead,
  priority = false,
  className,
}: {
  lead: NonNullable<TopicChapter["lead"]>;
  priority?: boolean;
  className?: string;
}) {
  const { topic, coverImage, coverImageMobile } = lead;
  const Icon = getTopicIcon(topic.slug);

  return (
    <Link
      href={`/topics/${topic.slug}`}
      className={cn(
        "hover-zoom group relative block aspect-[5/4] min-w-0 overflow-hidden rounded-[var(--radius-banner)] sm:aspect-[16/8] lg:aspect-auto lg:h-full lg:min-h-[26rem]",
        className,
      )}
    >
      <div className="media absolute inset-0 rounded-[var(--radius-banner)]">
        <Image
          src={coverImage}
          alt=""
          fill
          priority={priority}
          sizes="(max-width: 1024px) 96vw, 40vw"
          className="object-cover lg:hidden"
        />
        <Image
          src={coverImageMobile}
          alt=""
          fill
          priority={priority}
          sizes="40vw"
          className="hidden object-cover lg:block"
        />
        <span className="scrim" aria-hidden="true" />
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[3px] origin-right scale-x-0 bg-gradient-to-l from-transparent via-[var(--accent)] to-transparent opacity-0 transition-[transform,opacity] duration-500 ease-out group-hover:scale-x-100 group-hover:opacity-100"
      />

      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-5 sm:p-6">
        <span className="topic-lead-emblem glass-dark" aria-hidden="true">
          <Icon size={22} strokeWidth={1.9} />
        </span>
        <span className="eyebrow-pill eyebrow-pill--on-dark w-fit text-[.68rem]">
          <Layers size={13} aria-hidden="true" />
          سلسلة كاملة
        </span>
      </div>

      <div className="relative flex h-full flex-col justify-end gap-2.5 p-5 text-white sm:gap-3 sm:p-8">
        <p className="eyebrow-pill eyebrow-pill--on-dark w-fit text-[.68rem]">
          {formatCount(topic.episodeCount, EPISODE_FORMS)}
        </p>
        <h3 className="text-2xl font-black leading-[1.25] tracking-[-.02em] text-balance sm:text-3xl">{topic.title}</h3>
        <p className="hidden max-w-md text-sm leading-7 text-[var(--on-brand-soft)] sm:line-clamp-3 sm:block">
          {topic.description}
        </p>
        <span className="glass-dark mt-1 inline-flex w-fit items-center gap-1.5 rounded-[var(--radius-pill)] px-3.5 py-2 text-sm font-bold transition-[gap] group-hover:gap-2.5">
          تصفّح الموضوع <ChevronLeft size={15} aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
