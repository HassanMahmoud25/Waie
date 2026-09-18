import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { SeriesWithStats } from "@/types/series";

/** Series showcase: one full-bleed cinematic photo per series, text carried on a scrim like the homepage banners. */
export function SeriesCard({
  series,
  coverImageUrl,
  index,
}: {
  series: SeriesWithStats;
  coverImageUrl: string;
  index?: number;
}) {
  return (
    <Link
      href={`/series/${series.slug}`}
      className="hover-zoom group relative block aspect-[16/10] min-w-0 overflow-hidden rounded-[var(--radius-banner)] sm:aspect-video"
    >
      <div className="media absolute inset-0 rounded-[var(--radius-banner)]">
        <Image
          src={coverImageUrl}
          alt=""
          fill
          sizes="(max-width: 1024px) 96vw, 48vw"
          className="object-cover"
        />
        <span className="scrim" aria-hidden="true" />
      </div>

      {typeof index === "number" && (
        <span
          className="pointer-events-none absolute right-6 top-5 select-none text-6xl font-black leading-none text-transparent sm:top-6 sm:text-7xl"
          style={{ WebkitTextStroke: "1.5px rgba(255, 255, 255, 0.55)" }}
          aria-hidden="true"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      )}

      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[3px] origin-right scale-x-0 bg-gradient-to-l from-transparent via-[var(--accent)] to-transparent opacity-0 transition-[transform,opacity] duration-500 ease-out group-hover:scale-x-100 group-hover:opacity-100"
      />

      <div className="relative flex h-full flex-col justify-end gap-2.5 p-5 text-white sm:gap-3 sm:p-8">
        <p className="eyebrow-pill eyebrow-pill--on-dark w-fit text-[.68rem]">{series.episodeCount} حلقة</p>
        <h2 className="text-xl font-black leading-[1.25] tracking-[-.02em] text-balance sm:text-2xl md:text-3xl">
          {series.title}
        </h2>
        <p className="hidden max-w-lg text-sm leading-7 text-[var(--on-brand-soft)] sm:block">
          {series.description}
        </p>
        <span className="glass-dark mt-1 inline-flex w-fit items-center gap-1.5 rounded-[var(--radius-pill)] px-3.5 py-2 text-sm font-bold transition-[gap] group-hover:gap-2.5">
          عرض الحلقات <ChevronLeft size={15} aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
