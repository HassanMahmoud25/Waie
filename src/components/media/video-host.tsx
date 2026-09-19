"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { attachYouTube, getSlotElement } from "@/lib/playback/engine";
import type { PlaybackSnapshot, VideoRequest } from "@/lib/playback/engine";
import type { MediaItem } from "@/lib/playback/item";
import { MiniVideoStrip } from "./now-playing";

/**
 * The one YouTube iframe, mounted in the root layout so navigation can't
 * unmount it. It exists only while the engine has a video request -- the
 * episode page is showing an episode's video, or a video is playing/paused --
 * and never reloads while it does: moving between "over the episode page's
 * frame" and "mini player in the corner" is a CSS placement change on the same
 * DOM node (an iframe that is re-parented, or removed and re-added, reloads and
 * loses playback).
 *
 * Over the page it's `position: absolute` in *document* coordinates rather than
 * fixed to the viewport, so it scrolls with the content on the compositor with
 * no JS in the loop -- a fixed overlay chasing a scrolling frame visibly lags on
 * touch devices.
 */
export function VideoHost({ state }: { state: PlaybackSnapshot }) {
  return state.videoRequest ? <LiveVideoHost request={state.videoRequest} state={state} /> : null;
}

function embedSrc(request: VideoRequest): string {
  const params = new URLSearchParams({
    enablejsapi: "1",
    playsinline: "1",
    origin: window.location.origin,
  });
  if (request.startAt > 0) params.set("start", String(Math.floor(request.startAt)));
  if (request.autoplay) params.set("autoplay", "1");
  return `https://www.youtube-nocookie.com/embed/${request.item.youtubeVideoId}?${params}`;
}

function LiveVideoHost({ request, state }: { request: VideoRequest; state: PlaybackSnapshot }) {
  // The iframe's src is fixed for its whole life; later videos are loaded through the player API.
  const [initial] = useState(request);
  const [iframe, setIframe] = useState<HTMLIFrameElement | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const overSlot = state.slotEpisodeId === request.item.episodeId;
  const isHolding = state.item?.episodeId === request.item.episodeId && state.mode === "video" && state.isLoaded;
  // Not-yet-started iframes only make sense over their page; without a slot they're about to be torn down.
  const placement = overSlot ? "slot" : "mini";
  const hidden = placement === "mini" && !isHolding;

  useEffect(() => {
    if (!iframe) return;
    return attachYouTube(iframe, initial.loadId);
  }, [iframe, initial.loadId]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || placement !== "slot") return;
    const slot = getSlotElement();
    if (!slot) return;

    const place = () => {
      const rect = slot.getBoundingClientRect();
      root.style.top = `${rect.top + window.scrollY}px`;
      root.style.left = `${rect.left + window.scrollX}px`;
      root.style.width = `${rect.width}px`;
      root.style.height = `${rect.height}px`;
    };
    place();

    // The slot moves when the page above it reflows (fonts, images, the route transition's slide).
    const observer = new ResizeObserver(place);
    observer.observe(slot);
    observer.observe(document.body);
    window.addEventListener("resize", place);
    // A short frame loop covers what observers can't see: the CSS entrance transform on route change.
    const started = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      place();
      if (now - started < 900) frame = requestAnimationFrame(tick);
    });

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", place);
      cancelAnimationFrame(frame);
      root.removeAttribute("style");
    };
  }, [placement, state.slotVersion]);

  const item: MediaItem = request.item;

  return (
    <div
      ref={rootRef}
      className="media-host"
      data-placement={placement}
      data-hidden={hidden || undefined}
      role={placement === "mini" ? "region" : undefined}
      aria-label={placement === "mini" ? "مشغّل الفيديو" : undefined}
    >
      <div className="media-host__frame">
        <iframe
          ref={setIframe}
          className="media-host__iframe"
          src={embedSrc(initial)}
          title={item.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      {placement === "mini" && isHolding && state.item && <MiniVideoStrip state={{ ...state, item: state.item }} />}
    </div>
  );
}
