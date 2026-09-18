import Link from "next/link";
import type { CSSProperties } from "react";
import type { Topic } from "@/types/topic";

/** Compact topic tag for dense inline lists (search suggestions, related-topics rows). */
export function TopicChip({ topic }: { topic: Topic }) {
  return (
    <Link
      href={`/topics/${topic.slug}`}
      className="chip w-fit"
      style={{ backgroundColor: "color-mix(in srgb, var(--chip-color) 16%, var(--glass-light))", "--chip-color": topic.color } as CSSProperties}
    >
      <i className="size-2 shrink-0 rounded-full" style={{ backgroundColor: topic.color }} aria-hidden="true" />
      {topic.title}
    </Link>
  );
}
