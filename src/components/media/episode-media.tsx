"use client";

import { usePlayback } from "@/hooks/use-playback";
import { setMode, setPreferredMode } from "@/lib/playback/engine";
import type { MediaItem, MediaMode, PlaybackNeighbors } from "@/lib/playback/item";
import { AudioSurface } from "./audio-surface";
import { MediaModeSwitch } from "./mode-switch";
import { VideoSlot } from "./video-slot";

/**
 * The episode page's large player: the Watch/Listen switch and, under it,
 * whichever surface matches the mode. Both surfaces are only views of the
 * global engine, so nothing here is what actually plays -- see
 * lib/playback/engine.ts.
 */
export function EpisodeMedia({ item, neighbors }: { item: MediaItem; neighbors: PlaybackNeighbors }) {
  const playback = usePlayback();
  const audioAvailable = item.audioUrl !== null;

  // If this episode is the one the player holds, its mode is the truth; otherwise it's whatever the visitor last chose.
  const isCurrent = playback.item?.episodeId === item.episodeId;
  const wanted: MediaMode = isCurrent ? playback.mode : playback.preferredMode;
  const mode: MediaMode = wanted === "audio" && audioAvailable ? "audio" : "video";

  const handleChange = (next: MediaMode) => (isCurrent ? setMode(next) : setPreferredMode(next));

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <MediaModeSwitch mode={mode} audioAvailable={audioAvailable} onChange={handleChange} />
        {!audioAvailable && (
          <p id="mode-switch-hint" className="text-sm font-bold text-[var(--ink-soft)]">
            النسخة الصوتية لهذه الحلقة قيد الإعداد.
          </p>
        )}
      </div>
      <div className="overflow-hidden rounded-[var(--radius-banner)]">
        {mode === "audio" ? <AudioSurface item={item} neighbors={neighbors} /> : <VideoSlot item={item} neighbors={neighbors} />}
      </div>
    </div>
  );
}
