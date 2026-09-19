"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils/cn";
import { formatTimestamp } from "@/lib/utils/format";

/**
 * Seek bar with elapsed/total labels. Purely presentational: the caller says
 * where playback is and what to do when the visitor lets go, so the same bar
 * serves the live engine and an episode that's merely showing its saved spot.
 * Drags are held locally and committed on release -- seeking a media element on
 * every pixel of a drag makes streams stutter.
 *
 * Timelines run left-to-right even in this RTL site, matching the rest of the
 * player controls (and every media player's convention).
 */
export function TimeSlider({
  value,
  max,
  onCommit,
  label = "موضع التشغيل",
  showTimes = true,
  className,
}: {
  value: number;
  max: number;
  onCommit: (seconds: number) => void;
  label?: string;
  showTimes?: boolean;
  className?: string;
}) {
  const [scrubTime, setScrubTime] = useState<number | null>(null);
  const safeMax = Math.max(1, Math.floor(max));
  const shown = Math.min(scrubTime ?? value, safeMax);

  const commit = () => {
    if (scrubTime === null) return;
    onCommit(scrubTime);
    setScrubTime(null);
  };

  return (
    <div className={cn("flex items-center gap-2 sm:gap-3", className)} dir="ltr">
      {showTimes && <span className="media-time">{formatTimestamp(shown)}</span>}
      <input
        type="range"
        className="media-range min-w-0 flex-1"
        aria-label={label}
        aria-valuetext={`${formatTimestamp(shown)} من ${formatTimestamp(max)}`}
        min={0}
        max={safeMax}
        step={1}
        value={Math.floor(shown)}
        style={{ "--fill": `${(shown / safeMax) * 100}%` } as CSSProperties}
        onChange={(event) => setScrubTime(Number(event.target.value))}
        onPointerUp={commit}
        onKeyUp={commit}
        onBlur={commit}
      />
      {showTimes && <span className="media-time media-time--end">{formatTimestamp(max)}</span>}
    </div>
  );
}
