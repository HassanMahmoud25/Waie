"use client";

import { useEffect } from "react";
import {
  BOOT_ANIMATION_MS,
  BOOT_ATTRIBUTE,
  BOOT_FADE_MS,
  BOOT_HOLD_MS,
  BOOT_LOGO_ANIMATION,
  BOOT_MAX_WAIT_MS,
  BOOT_PENDING_SELECTOR,
  BOOT_REDUCED_MOTION_MIN_MS,
} from "@/lib/boot/config";

const POLL_MS = 50;
/** Lets a just-streamed-in boundary finish hydrating (its localStorage state flips in an effect) before we look at the page. */
const HYDRATION_SETTLE_MS = 120;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, Math.max(0, ms)));

const nextFrames = (count: number) =>
  new Promise<void>((resolve) => {
    let seen = 0;
    const tick = () => (++seen >= count ? resolve() : requestAnimationFrame(tick));
    requestAnimationFrame(tick);
  });

/**
 * When the splash may end, in `performance.now()` terms. The logo animation
 * starts when its file finishes downloading, not at navigation start, so on a
 * slow connection the clock starts late and it still gets to play in full.
 */
function splashEndsAt() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return BOOT_REDUCED_MOTION_MIN_MS;
  const [logo] = performance.getEntriesByName(new URL(BOOT_LOGO_ANIMATION, location.href).href);
  const startedAt = (logo as PerformanceResourceTiming | undefined)?.responseEnd ?? 0;
  return startedAt + BOOT_ANIMATION_MS + BOOT_HOLD_MS;
}

function hasPendingContent() {
  return document.querySelector(BOOT_PENDING_SELECTOR) !== null;
}

/** Above-the-fold images the page marked `priority` (Next renders them fetchpriority="high"), skipping the responsive variants hidden by CSS. */
function whenCriticalImagesReady() {
  const images = Array.from(document.images).filter(
    (image) => image.getAttribute("fetchpriority") === "high" && image.getClientRects().length > 0,
  );
  return Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete) return resolve();
          image.addEventListener("load", () => resolve(), { once: true });
          image.addEventListener("error", () => resolve(), { once: true });
        }).then(() => image.decode().catch(() => undefined)),
    ),
  );
}

/**
 * Resolves once the first thing the visitor sees will be stable:
 *
 *  1. No loading placeholder is left in the DOM -- a route still streaming
 *     from a slow database (loading.tsx skeleton) or a client-only section
 *     still waiting on localStorage (e.g. the library page).
 *  2. Web fonts are loaded, so text doesn't reflow from the fallback face.
 *  3. The hero/LCP images are decoded, so they don't pop in.
 *  4. The logo animation has played out (see splashEndsAt).
 *  5. React has flushed the post-hydration state updates (auth avatar,
 *     "continue watching" rail, ...) -- two frames after everything above.
 *
 * `isActive` lets the caller abandon the wait (deadline hit / unmounted)
 * without leaving a poll loop running.
 */
async function waitForCriticalState(isActive: () => boolean) {
  do {
    while (isActive() && hasPendingContent()) await wait(POLL_MS);
    await Promise.all([document.fonts?.ready ?? Promise.resolve(), whenCriticalImagesReady()]);
    // After the image gate: the logo's download time is only known once it has arrived.
    await wait(splashEndsAt() - performance.now());
    await wait(HYDRATION_SETTLE_MS);
    await nextFrames(2);
    // A boundary that suspended again while we waited sends us back to step 1.
  } while (isActive() && hasPendingContent());
}

/**
 * Lifts the startup overlay (components/boot/boot-overlay.tsx) once
 * waitForCriticalState() resolves, or at BOOT_MAX_WAIT_MS at the latest --
 * whichever comes first, so the overlay can never trap the visitor. Renders
 * nothing; all visuals are CSS driven by the <html data-boot> attribute.
 */
export function BootController() {
  useEffect(() => {
    const root = document.documentElement;
    // Already lifted (client navigation remount, Fast Refresh, bfcache restore) or never armed (no inline script).
    if (root.getAttribute(BOOT_ATTRIBUTE) !== "loading") return;

    let active = true;
    const isActive = () => active;

    const deadline = wait(BOOT_MAX_WAIT_MS - performance.now());
    Promise.race([waitForCriticalState(isActive), deadline]).then(() => {
      if (!active) return;
      active = false;
      root.setAttribute(BOOT_ATTRIBUTE, "leaving");
      // Deliberately not cancelled on unmount: once the fade has begun it should always finish.
      setTimeout(() => root.setAttribute(BOOT_ATTRIBUTE, "ready"), BOOT_FADE_MS);
    });

    return () => {
      active = false;
    };
  }, []);

  return null;
}
