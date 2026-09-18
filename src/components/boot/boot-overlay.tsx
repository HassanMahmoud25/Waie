import Image from "next/image";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { BootController } from "./boot-controller";

/**
 * Full-screen startup overlay, rendered in the root layout so it is part of
 * the very first server-rendered HTML and styled by the render-blocking
 * stylesheet -- it is painted before any page content can be. It is pure
 * markup: visibility is driven by the `data-boot` attribute on <html> (see
 * lib/boot/config.ts) and lifted by <BootController />.
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
          src="/brand/logo-white.png"
          alt=""
          width={1251}
          height={1002}
          sizes="192px"
          priority
          className="boot-overlay__logo"
        />
      </div>
      <BootController />
    </div>
  );
}
