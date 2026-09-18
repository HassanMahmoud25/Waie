import type { Episode } from "@/types/episode";
import { getProgressPercent, type ProgressEntry } from "@/hooks/use-library";
import { cn } from "@/lib/utils/cn";

/**
 * Fixed proportions of the trail's own coordinate space (0-100 wide), not
 * pixels. The wrapper's CSS `aspect-ratio` is kept equal to `100 / WAVE_HEIGHT`
 * so the SVG always scales uniformly (no `preserveAspectRatio="none"`
 * stretch) -- letting the stroke and its dash pattern render as plain,
 * predictable geometry at any card width.
 */
const WAVE_HEIGHT = 13;
const WAVE_MARGIN = 5;
const WAVE_AMPLITUDE = 2.3;
const WAVE_FREQUENCY = 1.15;
const WAVE_SAMPLES = 48;

function waveX(t: number) {
  return WAVE_MARGIN + t * (100 - WAVE_MARGIN * 2);
}

function waveY(t: number) {
  return WAVE_HEIGHT / 2 + Math.sin(t * Math.PI * 2 * WAVE_FREQUENCY) * WAVE_AMPLITUDE;
}

/**
 * A gentle, fixed sine curve -- the same flowing "S" language as the big
 * desktop journey route (see series-episode-list.tsx), shrunk into a single
 * miniature trail. It's pure trigonometry rather than something measured off
 * real thumbnails, so unlike the big route this needs no layout effect or
 * ResizeObserver: the same `d` works at any card width.
 */
const WAVE_PATH = (() => {
  let d = "";
  for (let i = 0; i <= WAVE_SAMPLES; i++) {
    const t = i / WAVE_SAMPLES;
    d += `${i === 0 ? "M" : "L"} ${waveX(t)} ${waveY(t)}`;
  }
  return d;
})();

type EpisodeState = "completed" | "current" | "upcoming";

/**
 * The series page's headline progress piece: a miniature waypoint trail
 * echoing the big episode route below it, plus the exact "N of M" count.
 * Each dot is that episode's own real state (never inferred from position),
 * while the glowing traveled stretch of the line reflects the furthest
 * point actually reached, including live progress into the current
 * episode -- so the trail keeps drifting forward as the viewer watches, not
 * just when an episode crosses the completion threshold.
 */
export function SeriesJourneyProgress({
  episodes,
  progress,
  currentEpisodeId,
}: {
  episodes: Episode[];
  progress: Record<string, ProgressEntry>;
  currentEpisodeId: string | null;
}) {
  const total = episodes.length;
  if (total === 0) return null;

  const completedCount = episodes.reduce((sum, episode) => sum + (progress[episode.id]?.completed ? 1 : 0), 0);
  const currentIndex = currentEpisodeId ? episodes.findIndex((episode) => episode.id === currentEpisodeId) : -1;
  const currentEpisode = currentIndex >= 0 ? episodes[currentIndex] : undefined;
  const currentPercent = currentEpisode ? getProgressPercent(progress[currentEpisode.id]) : 0;
  const percentComplete = Math.round((completedCount / total) * 100);

  let furthestIndex = -1;
  episodes.forEach((episode, i) => {
    if (progress[episode.id]?.completed) furthestIndex = i;
  });
  if (currentIndex > furthestIndex) furthestIndex = currentIndex;
  const travelFraction =
    furthestIndex < 0
      ? 0
      : Math.min(1, (furthestIndex + (currentIndex === furthestIndex ? currentPercent / 100 : 1)) / total);

  return (
    <div className="journey-progress glass-panel">
      <div className="journey-progress__row">
        <div className="journey-progress__stat justify-between">
          <p className="journey-progress__count">
            أكملت <strong key={completedCount}>{completedCount}</strong> من {total} حلقة
          </p>
          <p className="journey-progress__percent">{percentComplete}% مكتمل</p>
        </div>

        <div className="journey-progress__trail" aria-hidden="true">
          <svg viewBox={`0 0 100 ${WAVE_HEIGHT}`}>
            <path d={WAVE_PATH} pathLength={100} className="journey-progress__trail-base" />
            <path
              d={WAVE_PATH}
              pathLength={100}
              className="journey-progress__trail-fill"
              style={{ strokeDasharray: 100, strokeDashoffset: 100 - travelFraction * 100 }}
            />
          </svg>
          {episodes.map((episode, i) => {
            const t = (i + 0.5) / total;
            const state: EpisodeState = progress[episode.id]?.completed
              ? "completed"
              : i === currentIndex
                ? "current"
                : "upcoming";
            return (
              <span
                key={episode.id}
                className={cn("journey-progress__dot", `journey-progress__dot--${state}`)}
                style={{ left: `${waveX(t)}%`, top: `${(waveY(t) / WAVE_HEIGHT) * 100}%` }}
              />
            );
          })}
        </div>
      </div>

      {currentEpisode && <p className="journey-progress__current line-clamp-1">تتابع الآن: {currentEpisode.title}</p>}
    </div>
  );
}
