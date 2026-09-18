import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Episode } from "@/types/episode";

/** Previous/next episode within the same series — keeps the sequence navigable from the episode page itself. */
export function PrevNextNav({ previous, next }: { previous: Episode | null; next: Episode | null }) {
  if (!previous && !next) return null;

  return (
    <nav aria-label="التنقل بين الحلقات" className="grid gap-4 sm:grid-cols-2">
      {previous ? (
        <Link
          href={`/episodes/${previous.slug}`}
          className="glass-panel hover-zoom group flex min-w-0 items-center gap-4 p-3 sm:p-4"
        >
          <ChevronRight size={18} className="hidden shrink-0 text-[var(--muted)] sm:block" aria-hidden="true" />
          <div className="media relative aspect-video w-28 shrink-0 overflow-hidden sm:w-32">
            <Image src={previous.thumbnailUrl} alt="" fill sizes="(min-width: 640px) 128px, 112px" className="object-cover" />
          </div>
          <span className="min-w-0">
            <span className="block text-xs font-bold text-[var(--muted)]">الحلقة السابقة</span>
            <span className="mt-1 block truncate font-bold group-hover:text-black">{previous.title}</span>
          </span>
        </Link>
      ) : (
        <span />
      )}

      {next ? (
        <Link
          href={`/episodes/${next.slug}`}
          className="glass-panel hover-zoom group flex min-w-0 items-center gap-4 p-3 sm:p-4"
        >
          <div className="media relative aspect-video w-28 shrink-0 overflow-hidden sm:w-32">
            <Image src={next.thumbnailUrl} alt="" fill sizes="(min-width: 640px) 128px, 112px" className="object-cover" />
          </div>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-bold text-[var(--muted)]">الحلقة التالية</span>
            <span className="mt-1 block truncate font-bold group-hover:text-black">{next.title}</span>
          </span>
          <ChevronLeft size={18} className="hidden shrink-0 text-[var(--muted)] sm:block" aria-hidden="true" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
