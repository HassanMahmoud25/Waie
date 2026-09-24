"use client";

import { usePlayback } from "@/hooks/use-playback";
import { setMode, setPreferredMode } from "@/lib/playback/engine";
import type { MediaItem, MediaMode, PlaybackNeighbors } from "@/lib/playback/item";
import { AudioSurface } from "./audio-surface";
import { SoundCloudAudioSurface } from "./soundcloud-audio-surface";
import { MediaModeSwitch } from "./mode-switch";
import { VideoSlot } from "./video-slot";

/**
 * The episode page's large player: the Watch/Listen switch and, under it,
 * whichever surface matches the mode. VideoSlot and AudioSurface are only
 * views of the global engine (lib/playback/engine.ts) -- nothing in them is
 * what actually plays. SoundCloudAudioSurface is the one exception: a
 * SoundCloud-sourced episode (item.soundcloudEmbedSrc, see
 * lib/audio/soundcloud.ts) plays entirely inside its own iframe, outside the
 * engine.
 */
export function EpisodeMedia({ item, neighbors }: { item: MediaItem; neighbors: PlaybackNeighbors }) {
  const playback = usePlayback();
  const isSoundCloud = item.soundcloudEmbedSrc !== null;
  const audioAvailable = Boolean(item.audioUrl || item.soundcloudEmbedSrc);

  // If this episode is the one the player holds, its mode is the truth; otherwise it's whatever
  // the visitor last chose. Not for a SoundCloud episode, though: the engine's mode can only ever
  // be "video" for one of these (see SoundCloudAudioSurface's own doc comment -- its iframe isn't a
  // source lib/playback/engine.ts can hold as "audio"), so trusting it here would make Listen
  // impossible to select for an episode the engine is currently holding as video.
  const isCurrent = playback.item?.episodeId === item.episodeId;
  const wanted: MediaMode = isCurrent && !isSoundCloud ? playback.mode : playback.preferredMode;
  const mode: MediaMode = wanted === "audio" && audioAvailable ? "audio" : "video";

  const handleChange = (next: MediaMode) =>
    isSoundCloud ? setPreferredMode(next) : isCurrent ? setMode(next) : setPreferredMode(next);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <MediaModeSwitch mode={mode} audioAvailable={audioAvailable} onChange={handleChange} />
      </div>
      <div className="overflow-hidden rounded-[var(--radius-banner)]">
        {mode === "audio" ? (
          item.soundcloudEmbedSrc ? (
            <SoundCloudAudioSurface item={item} embedSrc={item.soundcloudEmbedSrc} />
          ) : (
            <AudioSurface item={item} neighbors={neighbors} />
          )
        ) : (
          <VideoSlot item={item} neighbors={neighbors} />
        )}
      </div>
    </div>
  );
}
