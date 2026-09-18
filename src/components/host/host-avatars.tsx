import Image from "next/image";
import type { Host } from "@/types/host";
import { cn } from "@/lib/utils/cn";

const SIZE_PX = { xs: 22, sm: 28, md: 36, lg: 48, xl: 72 } as const;

/**
 * Small overlapping circular host portraits — the one reusable building
 * block behind every host appearance across the app (episode cards, the
 * episode hero, the homepage hosts section). Always resolve the `hosts`
 * prop through `resolveEpisodeHosts()` (lib/utils/content.ts) rather than
 * reading `episode.hosts` directly, so an episode with no explicit lineup
 * still renders the show's default hosts consistently everywhere.
 *
 * Deliberately a Server Component: the hover-to-reveal-name interaction is
 * pure CSS (`group-hover`), so no client JS is needed just to show it.
 */
export function HostAvatars({
  hosts,
  size = "md",
  ringColor = "var(--paper)",
  tooltipSide = "top",
  className,
}: {
  hosts: Host[];
  size?: keyof typeof SIZE_PX;
  /** The ring drawn between overlapping avatars — match the surface they sit on (cream card vs. dark photo). */
  ringColor?: string;
  tooltipSide?: "top" | "bottom";
  className?: string;
}) {
  if (hosts.length === 0) return null;
  const px = SIZE_PX[size];
  const overlap = Math.round(px * 0.38);

  return (
    <div
      className={cn("flex items-center", className)}
      role="group"
      aria-label={`المتحدثون: ${hosts.map((host) => host.name).join("، ")}`}
    >
      {hosts.map((host, index) => (
        <div
          key={host.id}
          className="group/avatar relative shrink-0 transition-transform duration-300 ease-out hover:z-10 hover:scale-[1.15]"
          style={{
            width: px,
            height: px,
            marginInlineStart: index === 0 ? 0 : -overlap,
            zIndex: hosts.length - index,
          }}
        >
          <div
            className="h-full w-full overflow-hidden rounded-full"
            style={{ boxShadow: `0 0 0 2px ${ringColor}, var(--shadow-sm)` }}
          >
            <Image
              src={host.photoUrl}
              alt={host.name}
              width={px * 2}
              height={px * 2}
              className="h-full w-full object-cover"
            />
          </div>
          <span
            className={cn(
              "pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-black px-3 py-1.5 text-xs font-bold text-white opacity-0 shadow-[var(--shadow-md)] transition-opacity duration-200 group-hover/avatar:opacity-100",
              tooltipSide === "top" ? "bottom-full mb-2" : "top-full mt-2",
            )}
          >
            {host.name}
          </span>
        </div>
      ))}
    </div>
  );
}
