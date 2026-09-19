"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { usePlayback } from "@/hooks/use-playback";
import { modeFor, playItem, registerSlot } from "@/lib/playback/engine";
import type { MediaItem, PlaybackNeighbors } from "@/lib/playback/item";

/**
 * The episode page's video area. It is only a *place*: an empty 16:9 frame
 * showing the episode's poster. The actual YouTube iframe lives in the root
 * layout (see video-host.tsx) and is laid over this frame while this page is
 * open -- which is what lets the same iframe carry on playing, unreloaded, as a
 * mini player after the visitor navigates away.
 *
 * If a different episode's video is currently playing (mini player), the
 * single iframe is busy, so this frame offers a play button that hands it over
 * to this episode instead of showing a second, competing player.
 */
export function VideoSlot({ item, neighbors }: { item: MediaItem; neighbors: PlaybackNeighbors }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const { videoRequest } = usePlayback();

  useEffect(() => {
    // The first client render matches the server's (video), so a visitor whose saved choice is
    // Audio sees this slot for one frame before the audio surface replaces it. Don't announce a
    // video slot then: it would start loading the YouTube embed for a player about to vanish.
    if (modeFor(item) === "audio") return;
    return registerSlot(item, frameRef.current, "video", neighbors);
  }, [item, neighbors]);

  const iframeIsElsewhere = videoRequest !== null && videoRequest.item.episodeId !== item.episodeId;

  return (
    <div ref={frameRef} className="relative aspect-video overflow-hidden bg-black">
      <Image
        src={item.thumbnailUrl}
        alt=""
        fill
        sizes="(min-width: 1024px) 1100px, 100vw"
        className="object-cover"
      />
      {iframeIsElsewhere && (
        <>
          <div className="absolute inset-0 bg-black/35" aria-hidden="true" />
          <div className="absolute inset-0 grid place-items-center">
            <button
              type="button"
              className="media-btn media-btn--primary media-btn--lg"
              aria-label={`تشغيل الفيديو: ${item.title}`}
              onClick={() => playItem(item, { mode: "video", neighbors })}
            >
              <Play size={26} fill="currentColor" aria-hidden="true" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
