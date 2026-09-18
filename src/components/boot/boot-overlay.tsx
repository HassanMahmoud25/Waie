import Image from "next/image";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { BOOT_LOGO_ANIMATION, BOOT_LOGO_SIZE } from "@/lib/boot/config";
import { BootController } from "./boot-controller";

/**
 * Full-screen startup overlay, rendered in the root layout so it is part of
 * the very first server-rendered HTML and styled by the render-blocking
 * stylesheet -- it is painted before any page content can be. It is pure
 * markup: visibility is driven by the `data-boot` attribute on <html> (see
 * lib/boot/config.ts) and lifted by <BootController />.
 *
 * The logo is a pre-rendered animated WebP with transparency (an ink mass
 * painted in, the stencil then falling away), extracted from the Waie
 * reference animation. It ends on the reference's own final frame, with the
 * mark held still. `unoptimized` on purpose: the image optimizer would re-encode it and
 * drop the animation. It is the first element in <body> with
 * fetchpriority="high", so the browser fetches it as soon as the HTML starts
 * arriving. Visitors with reduced motion see the plain overlay (see CSS).
 *
 * Shown only on a real document load (first visit, refresh, hard reload).
 * Client-side route changes never touch it, so page-level loading.tsx
 * skeletons keep behaving exactly as before.
 */
export function BootOverlay() {
  return (
    <div className="boot-overlay" role="status">
      <VisuallyHidden>جارٍ تحميل وعي…</VisuallyHidden>
      <div className="boot-overlay__mark" aria-hidden="true">
        <Image
          src={BOOT_LOGO_ANIMATION}
          alt=""
          width={BOOT_LOGO_SIZE.width}
          height={BOOT_LOGO_SIZE.height}
          priority
          unoptimized
          className="boot-overlay__logo"
        />
      </div>
      <BootController />
    </div>
  );
}
