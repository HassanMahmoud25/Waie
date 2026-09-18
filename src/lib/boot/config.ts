/**
 * Shared constants for the startup overlay (components/boot/*).
 *
 * The overlay's lifecycle lives in one attribute on <html>, so pure CSS can
 * react to it without any React state (and therefore without any hydration
 * risk):
 *
 *   (absent)  no JS ran -> no overlay at all, the server-rendered page just shows
 *   loading   overlay opaque; page entrance animations paused behind it
 *   leaving   overlay fading out; entrance animations play as it lifts
 *   ready     overlay removed (display: none) for the rest of the session
 */
export const BOOT_ATTRIBUTE = "data-boot";
export type BootState = "loading" | "leaving" | "ready";

/**
 * Minimum time the overlay stays up, measured from navigation start (not from
 * mount), so a fast load still lets the logo reveal finish instead of
 * flashing a half-played splash -- while a slow load never pays this on top.
 */
export const BOOT_MIN_VISIBLE_MS = 1100;

/** Give up waiting for the critical state after this long (from navigation start) and reveal anyway. */
export const BOOT_MAX_WAIT_MS = 7000;

/** Fade-out length. Keep in sync with `--boot-fade` in globals.css. */
export const BOOT_FADE_MS = 700;

/** Last-resort unstick, run by the inline script itself, so it works even if the JS bundle never loads. */
export const BOOT_FAILSAFE_MS = 12000;

/** Anything carrying this attribute is a loading placeholder (see ui/skeleton.tsx). */
export const BOOT_PENDING_SELECTOR = "[data-skeleton]";

/**
 * Runs synchronously in <head>, before the first paint, and only when
 * scripting is enabled -- which is what makes the overlay opt-in: with JS
 * disabled the attribute is never set and the CSS never shows the overlay.
 */
export const bootInlineScript = `(function(){var d=document.documentElement;d.setAttribute("${BOOT_ATTRIBUTE}","loading");setTimeout(function(){if(d.getAttribute("${BOOT_ATTRIBUTE}")==="loading")d.setAttribute("${BOOT_ATTRIBUTE}","ready")},${BOOT_FAILSAFE_MS})})();`;
