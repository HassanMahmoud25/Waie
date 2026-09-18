"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { setSkipHandler } from "@/lib/playback/audio-engine";

/**
 * Mounted once in the site layout. The audio engine is router-agnostic, so
 * when the lock screen's next/previous button switches episodes this follows
 * up by navigating the page -- but only if the visitor is on the page of the
 * episode that just changed. Elsewhere on the site (or in another app) the
 * audio switches and the page is left alone; the new episode's own page
 * shows the live state whenever they next open it.
 */
export function AudioPlaybackBridge() {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    setSkipHandler((from, to) => {
      if (pathnameRef.current === `/episodes/${from.slug}`) {
        router.push(`/episodes/${to.slug}`);
      }
    });
    return () => setSkipHandler(null);
  }, [router]);

  return null;
}
