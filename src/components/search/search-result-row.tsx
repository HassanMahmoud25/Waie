import Link from "next/link";
import { ChevronLeft, Layers, Tag as TagIcon } from "lucide-react";
import type { Series } from "@/types/series";
import type { Topic } from "@/types/topic";

/** Series/topic results get a slim row — episodes get their own full EpisodeCard grid, so results never look identical. */
export function SearchResultRow({
  item,
  kind,
  onClick,
}: {
  item: Series | Topic;
  kind: "series" | "topic";
  onClick?: () => void;
}) {
  const href = kind === "series" ? `/series/${item.slug}` : `/topics/${item.slug}`;
  const Icon = kind === "series" ? Layers : TagIcon;
  const label = kind === "series" ? "سلسلة" : "موضوع";

  return (
    <Link href={href} onClick={onClick} className="glass-panel flex items-center justify-between gap-4 px-5 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-black/10 text-black">
          <Icon size={16} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold text-[var(--muted)]">{label}</p>
          <p className="truncate font-bold">{item.title}</p>
        </div>
      </div>
      <ChevronLeft size={16} className="shrink-0 text-[var(--muted)]" aria-hidden="true" />
    </Link>
  );
}
