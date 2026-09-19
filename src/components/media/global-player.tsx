"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { usePlayback } from "@/hooks/use-playback";
import { setSkipHandler } from "@/lib/playback/engine";
import { NowPlayingBar } from "./now-playing";
import { VideoHost } from "./video-host";

/** Extra bottom padding the page needs so the dock never hides the last of the page. */
const CLEARANCE = { bar: "92px", card: "292px" } as const;

/**
 * Mounted once, in the root layout: the only React that has to outlive route
 * changes. It renders the persistent iframe host and the compact Now Playing
 * dock; everything they show comes from the engine (lib/playback/engine.ts).
 *
 * It also bridges the router-agnostic engine to navigation: when a skip
 * (lock screen or dock button) switches episodes, follow it with a page
 * navigation -- but only if the visitor is on the page of the episode that
 * just changed. Elsewhere on the site the media switches and the page is left
 * alone; the new episode's own page shows the live state whenever they next open it.
 */
export function GlobalPlayer() {
  const state = usePlayback();
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    setSkipHandler((from, to) => {
      if (pathnameRef.current === `/episodes/${from.slug}`) router.push(`/episodes/${to.slug}`);
    });
    return () => setSkipHandler(null);
  }, [router]);

  const { item } = state;
  const request = state.videoRequest;
  const videoIsHeld = item !== null && state.mode === "video" && state.isLoaded && request?.item.episodeId === item.episodeId;
  // An episode's own page shows its large player; never a second one for the same thing.
  const largePlayerIsOnScreen = item !== null && state.slotEpisodeId === item.episodeId;
  const dock = item === null || largePlayerIsOnScreen ? null : videoIsHeld ? "card" : "bar";

  useEffect(() => {
    if (!dock) return;
    const root = document.documentElement;
    root.style.setProperty("--media-dock-clearance", CLEARANCE[dock]);
    return () => {
      root.style.removeProperty("--media-dock-clearance");
    };
  }, [dock]);

  return (
    <>
      <VideoHost state={state} />
      {dock === "bar" && item && <NowPlayingBar state={{ ...state, item }} />}
    </>
  );
}
