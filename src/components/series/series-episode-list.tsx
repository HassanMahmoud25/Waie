"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { CircleDot, Flag } from "lucide-react";
import type { Episode } from "@/types/episode";
import { getProgressPercent, useLibrary } from "@/hooks/use-library";
import { EpisodeListItem } from "@/components/episode/episode-list-item";
import { SeriesJourneyProgress } from "@/components/series/series-journey-progress";

/** How far each card's hidden pass-through drifts off its true center --
 *  alternating sides by index so consecutive gap curves swing opposite
 *  ways and read as one continuous wave. Safely inside even the smallest
 *  (mobile, 144px-wide) thumbnail, so the drift never peeks out from under
 *  the image. */
const WAVE_OFFSET = 26;

/** Spacing (in px along the path) between the small rectangular waypoint
 *  markers that give the route its sense of direction. */
const CHEVRON_SPACING = 20;

type Point = { x: number; y: number };
type CardSpan = { x: number; top: number; bottom: number };
type Chevron = { x: number; y: number; angle: number; color: string; opacity: number };

/** A flowing "S" from (x1,y1) to (x2,y2) with a vertical tangent at *both*
 *  ends -- so it joins seamlessly with the dead-straight run above/below,
 *  the same way a real road eases into a curve instead of kinking at the
 *  seam. (A single cubic bezier can't bow sideways while leaving both its
 *  endpoints vertically, unless the endpoints themselves sit at different
 *  x's -- which is exactly what the alternating `anchorX` below sets up.) */
function flowTo(x1: number, y1: number, x2: number, y2: number) {
  const midY = (y1 + y2) / 2;
  return `C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
}

/** The x a given card's hidden vertical pass-through actually uses. */
function anchorX(card: CardSpan, index: number) {
  return card.x + (index % 2 === 0 ? WAVE_OFFSET : -WAVE_OFFSET);
}

/** One continuous path: a lean from the start marker into the first card, a
 *  straight run through each card's own middle (invisible under its
 *  thumbnail anyway), a flowing lean across each gap, and a final lean
 *  into the end marker. Every join shares a vertical tangent, so the route
 *  never kinks where it ducks behind or re-emerges from a thumbnail. */
function buildRoutePath(start: Point, cards: CardSpan[], end: Point): string {
  const firstX = anchorX(cards[0], 0);
  let d = `M ${start.x} ${start.y}`;
  d += ` ${flowTo(start.x, start.y, firstX, cards[0].top)}`;
  d += ` L ${firstX} ${cards[0].bottom}`;

  for (let i = 1; i < cards.length; i++) {
    const prevX = anchorX(cards[i - 1], i - 1);
    const x = anchorX(cards[i], i);
    d += ` ${flowTo(prevX, cards[i - 1].bottom, x, cards[i].top)}`;
    d += ` L ${x} ${cards[i].bottom}`;
  }

  const last = cards[cards.length - 1];
  const lastX = anchorX(last, cards.length - 1);
  d += ` ${flowTo(lastX, last.bottom, end.x, end.y)}`;
  return d;
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.trim().replace("#", "");
  const value = parseInt(clean, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

/** Lerping two muted brand colors in plain RGB washes out through a dull,
 *  grayish blend at the midpoint -- so the marks in the middle of the route
 *  read as weak next to the vivid ones at either end. Boosting saturation
 *  (and pulling lightness toward a punchier mid-range) after the blend
 *  keeps every mark along the route reading as an intentional, vivid color
 *  rather than fading into the background partway through. */
function vividize([r, g, b]: [number, number, number]): [number, number, number] {
  const [h, s, l] = rgbToHsl(r, g, b);
  const boostedS = Math.min(1, s * 2.6);
  const boostedL = Math.min(0.48, Math.max(0.3, l * 0.85));
  return hslToRgb(h, boostedS, boostedL);
}

/**
 * Renders the series' episodes as landmarks along one continuous route --
 * a start marker, a wavy line threading through/behind each thumbnail and
 * reappearing in the gaps, and an end marker. The path's `d` is computed
 * from the actual on-screen position of the start marker's own icon, every
 * thumbnail, and the end marker's own icon (see buildRoutePath), so it
 * stays correct regardless of how tall any given row's description happens
 * to render, and never travels behind the "start/end" labels themselves
 * (the anchor is the icon's edge, not the label row's midpoint).
 */
export function SeriesEpisodeList({ episodes }: { episodes: Episode[] }) {
  const { isHydrated, progress, getProgress } = useLibrary();
  const containerRef = useRef<HTMLDivElement>(null);
  const startIconRef = useRef<HTMLSpanElement>(null);
  const endIconRef = useRef<HTMLSpanElement>(null);
  const mediaRefs = useRef<Array<HTMLDivElement | null>>([]);
  const pathRef = useRef<SVGPathElement>(null);
  const [pathD, setPathD] = useState("");
  const [chevrons, setChevrons] = useState<Chevron[]>([]);
  const [travelPoint, setTravelPoint] = useState<Point | null>(null);

  // "Completed" is exact (never fabricated) -- the one episode called out as
  // "watching now" is whichever unfinished episode was touched most
  // recently, so the highlight tracks the viewer's actual last session
  // rather than e.g. episode order.
  const { completedCount, currentEpisodeId } = useMemo(() => {
    if (!isHydrated) return { completedCount: 0, currentEpisodeId: null as string | null };
    let completed = 0;
    let currentId: string | null = null;
    let currentUpdatedAt = -Infinity;
    for (const episode of episodes) {
      const entry = progress[episode.id];
      if (!entry) continue;
      if (entry.completed) {
        completed += 1;
        continue;
      }
      if (entry.seconds > 0 && entry.updatedAt > currentUpdatedAt) {
        currentUpdatedAt = entry.updatedAt;
        currentId = episode.id;
      }
    }
    return { completedCount: completed, currentEpisodeId: currentId };
  }, [episodes, isHydrated, progress]);

  const overallFraction = episodes.length > 0 ? completedCount / episodes.length : 0;

  useLayoutEffect(() => {
    const container = containerRef.current;
    const startIcon = startIconRef.current;
    const endIcon = endIconRef.current;
    if (!container || !startIcon || !endIcon) return;

    const measure = () => {
      const containerRect = container.getBoundingClientRect();
      const relative = (rect: DOMRect) => ({
        x: rect.left - containerRect.left + rect.width / 2,
        top: rect.top - containerRect.top,
        bottom: rect.bottom - containerRect.top,
      });

      const cards = mediaRefs.current
        .filter((el): el is HTMLDivElement => Boolean(el))
        .map((el) => relative(el.getBoundingClientRect()));
      if (cards.length === 0) {
        setPathD("");
        return;
      }

      // Anchor to the icon's own bottom/top edge (not its label row's
      // midpoint, and not its vertical center) so the route only ever
      // exists below the start label and above the end label -- never
      // level with the text itself.
      const startIconSpan = relative(startIcon.getBoundingClientRect());
      const endIconSpan = relative(endIcon.getBoundingClientRect());
      const start = { x: startIconSpan.x, y: startIconSpan.bottom };
      const end = { x: endIconSpan.x, y: endIconSpan.top };

      setPathD(buildRoutePath(start, cards, end));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [episodes.length, isHydrated]);

  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path || !pathD) {
      setChevrons([]);
      setTravelPoint(null);
      return;
    }

    const styles = getComputedStyle(document.documentElement);
    const from = hexToRgb(styles.getPropertyValue("--accent-strong") || "#9a6e32");
    const to = hexToRgb(styles.getPropertyValue("--brand") || "#1b5a4f");

    const length = path.getTotalLength();
    // Only dim the "not yet walked" stretch once the viewer has actually
    // completed something -- a series nobody has started should still read
    // as one vivid, inviting route, not a mostly-grayed-out one.
    const hasProgress = overallFraction > 0;
    const travelLength = length * Math.min(1, overallFraction);
    const count = Math.floor(length / CHEVRON_SPACING);
    const marks: Chevron[] = [];
    for (let i = 1; i < count; i++) {
      const l = i * CHEVRON_SPACING;
      const point = path.getPointAtLength(l);
      const before = path.getPointAtLength(Math.max(0, l - 1));
      const after = path.getPointAtLength(Math.min(length, l + 1));
      const angle = Math.atan2(after.y - before.y, after.x - before.x) * (180 / Math.PI);
      const t = l / length;
      const blended: [number, number, number] = [
        lerp(from[0], to[0], t),
        lerp(from[1], to[1], t),
        lerp(from[2], to[2], t),
      ];
      const [r, g, b] = vividize(blended);
      const traveled = !hasProgress || l <= travelLength;
      marks.push({ x: point.x, y: point.y, angle, color: `rgb(${r}, ${g}, ${b})`, opacity: traveled ? 1 : 0.3 });
    }
    setChevrons(marks);
    setTravelPoint(hasProgress ? path.getPointAtLength(travelLength) : null);
  }, [pathD, overallFraction]);

  return (
    <div className="journey" ref={containerRef}>
      <div className="journey-header">
        <h2 className="text-2xl font-black tracking-[-.02em] md:text-3xl">حلقات السلسلة</h2>
        {isHydrated && (
          <SeriesJourneyProgress episodes={episodes} progress={progress} currentEpisodeId={currentEpisodeId} />
        )}
      </div>

      <svg className="journey-route" aria-hidden="true">
        <path ref={pathRef} className="journey-route__guide" d={pathD} />
        {chevrons.map((chevron, index) => (
          <rect
            key={index}
            className="journey-route__chevron"
            x={-3.6}
            y={-1.9}
            width={7.2}
            height={3.8}
            rx={0.8}
            transform={`translate(${chevron.x} ${chevron.y}) rotate(${chevron.angle})`}
            style={{ fill: chevron.color, opacity: chevron.opacity }}
          />
        ))}
        {travelPoint && (
          <g transform={`translate(${travelPoint.x} ${travelPoint.y})`}>
            <circle r={5.5} className="journey-traveler__pulse" />
            <circle r={4} className="journey-traveler__dot" />
          </g>
        )}
      </svg>

      <div className="journey-pin journey-pin--start">
        <span className="journey-pin__icon" ref={startIconRef}>
          <CircleDot size={15} strokeWidth={2.25} />
        </span>
        <span className="journey-pin__label">بداية السلسلة</span>
        <span className="journey-pin__rule" />
      </div>

      <ol className="journey-list">
        {episodes.map((episode, index) => {
          const entry = isHydrated ? getProgress(episode.id) : undefined;

          return (
            <EpisodeListItem
              key={episode.id}
              episode={episode}
              order={index + 1}
              isCompleted={Boolean(entry?.completed)}
              isCurrent={episode.id === currentEpisodeId}
              progressPercent={getProgressPercent(entry)}
              mediaRef={(el) => {
                mediaRefs.current[index] = el;
              }}
            />
          );
        })}
      </ol>

      <div className="journey-pin journey-pin--end">
        <span className="journey-pin__icon" ref={endIconRef}>
          <Flag size={15} strokeWidth={2.25} />
        </span>
        <span className="journey-pin__label">نهاية السلسلة</span>
        <span className="journey-pin__rule" />
      </div>
    </div>
  );
}
