"use client";

import { useState } from "react";
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

  // What this page has explicitly switched to, for an episode that isn't (yet) the one the engine
  // holds -- e.g. choosing Listen before ever pressing play. Reset per episode (the parent passes
  // `key={item.slug}`, see (site)/episodes/[slug]/page.tsx) so it can never carry over to a
  // different episode's page; null means "no explicit choice made on this page yet".
  const [explicitMode, setExplicitMode] = useState<MediaMode | null>(null);

  // If this episode is the one the player holds (actively playing, or restored paused after a
  // refresh -- see engine.ts#init), its own mode is the truth, so resuming shows it exactly how it
  // was left. Not for a SoundCloud episode, though: the engine's mode can only ever be "video" for
  // one of these (see SoundCloudAudioSurface's own doc comment -- its iframe isn't a source
  // lib/playback/engine.ts can hold as "audio"), so trusting it here would make Listen impossible
  // to select for an episode the engine is currently holding as video.
  //
  // Otherwise: this page's own explicit choice if it made one, else Watch. `playback.preferredMode`
  // is deliberately not consulted here: it's a global "last mode used" flag (see
  // engine.ts#setMode/#setPreferredMode), and reading it here was what made *every* freshly opened
  // episode default to Listen for the rest of the browser session after a visitor picked Listen even
  // once, anywhere. `preferredMode` still does its other, legitimate job untouched -- e.g. keeping
  // the same mode across an engine-driven skip-to-next (engine.ts#modeFor) -- this only stops it
  // from leaking into an unrelated episode's first render.
  const isCurrent = playback.item?.episodeId === item.episodeId;
  const wanted: MediaMode = isCurrent && !isSoundCloud ? playback.mode : (explicitMode ?? "video");
  const mode: MediaMode = wanted === "audio" && audioAvailable ? "audio" : "video";

  const handleChange = (next: MediaMode) => {
    setExplicitMode(next);
    if (!isSoundCloud && isCurrent) setMode(next);
    else setPreferredMode(next);
  };

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
