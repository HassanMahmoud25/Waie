"use client";

import type { Episode } from "@/types/episode";
import type { SeriesWithStats } from "@/types/series";
import type { ContinueWatchingItem } from "@/lib/library/continue-watching";
import { useContinueWatching } from "@/hooks/use-continue-watching";
import { ContentRail } from "@/components/content/content-rail";
import { Reveal } from "@/components/shared/reveal";
import { ContinueWatchingCard } from "./continue-watching-card";

/**
 * "أكمل من حيث توقفت" — the homepage's Netflix-style continue-watching rail.
 * Item resolution (authenticated database rows vs. anonymous localStorage)
 * lives in hooks/use-continue-watching.ts, shared with the Library page's
 * own rail -- this component only owns the homepage's own heading/copy and
 * layout. No progress is ever fabricated: until there's a real answer
 * (server-fetched for signed-in visitors, hydrated from localStorage for
 * anonymous ones), this section renders nothing.
 */
export function ContinueWatchingSection({
  episodes,
  series,
  initialItems,
}: {
  episodes: Episode[];
  series: SeriesWithStats[];
  /** Server-computed via lib/library/continue-watching.ts; empty for anonymous visitors. */
  initialItems: ContinueWatchingItem[];
}) {
  const items = useContinueWatching(episodes, series, initialItems);

  if (items.length === 0) return null;

  return (
    <>
      <section className="section">
        <div className="container">
          <Reveal>
            <span className="home-eyebrow">مساحتك الخاصة</span>
            <h2 className="mt-3 text-xl font-black leading-[1.25] tracking-[-.02em] sm:text-2xl">
              أكمل من حيث توقفت
            </h2>

            <ContentRail className="rail--wide mt-8">
              {items.map(({ episode, series: episodeSeries, percent, remainingSeconds }) => (
                <div className="hover-rise" key={episode.id}>
                  <ContinueWatchingCard
                    episode={episode}
                    series={episodeSeries}
                    percent={percent}
                    remainingSeconds={remainingSeconds}
                  />
                </div>
              ))}
            </ContentRail>
          </Reveal>
        </div>
      </section>
      {/* Always followed by another flat-canvas section (bentoSeries, or
          whichever plain rail ends up next) -- the `.section:has(+
          .section-divider)`/`.section-divider + .section` rules in
          globals.css zero the padding on both sides of this automatically. */}
      <hr className="section-divider container" />
    </>
  );
}
