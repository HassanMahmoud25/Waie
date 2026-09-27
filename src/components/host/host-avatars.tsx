import Image from "next/image";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils/cn";

const SIZE_PX = { xs: 22, sm: 28, md: 36, lg: 48, xl: 72 } as const;

/** Minimal shape this component needs -- deliberately not `Host` (data/hosts.ts) or `Person` (types/person.ts), so it can render either without either domain type leaking into the other's usage. */
export type AvatarPerson = {
  id: string;
  name: string;
  imageUrl?: string | null;
};

/**
 * Small overlapping circular portraits — the one reusable building block
 * behind every "who's in this" avatar row across the app. Currently used for
 * an episode's participants (see resolveEpisodeHosts's retirement in favor of
 * `episode.participants`, app/(site)/episodes/[slug]/page.tsx) but not tied
 * to that concept -- it only ever renders whatever list of {id, name,
 * imageUrl} it's given.
 *
 * Deliberately a Server Component: the hover-to-reveal-name interaction is
 * pure CSS (`group-hover`), so no client JS is needed just to show it.
 */
export function HostAvatars({
  people,
  size = "md",
  ringColor = "var(--paper)",
  tooltipSide = "top",
  className,
}: {
  people: AvatarPerson[];
  size?: keyof typeof SIZE_PX;
  /** The ring drawn between overlapping avatars — match the surface they sit on (cream card vs. dark photo). */
  ringColor?: string;
  tooltipSide?: "top" | "bottom";
  className?: string;
}) {
  if (people.length === 0) return null;
  const px = SIZE_PX[size];
  const overlap = Math.round(px * 0.38);

  return (
    <div
      className={cn("flex items-center", className)}
      role="group"
      aria-label={`المشاركون: ${people.map((person) => person.name).join("، ")}`}
    >
      {people.map((person, index) => (
        // z-index goes through a CSS variable (--avatar-z) rather than a plain
        // inline zIndex, so hover:z-50 can actually win: an inline `style`
        // z-index always beats a stylesheet rule -- including a :hover one --
        // regardless of hover state, which silently made hover:z-10 a no-op
        // and left a later, lower-stacked avatar's face permanently covered
        // by its neighbor even while hovered.
        <div
          key={person.id}
          className="group/avatar relative shrink-0 z-[var(--avatar-z)] transition-transform duration-300 ease-out hover:z-50 hover:scale-[1.15]"
          style={
            {
              width: px,
              height: px,
              marginInlineStart: index === 0 ? 0 : -overlap,
              "--avatar-z": people.length - index,
            } as CSSProperties
          }
        >
          <div
            className="h-full w-full overflow-hidden rounded-full"
            style={{ boxShadow: `0 0 0 2px ${ringColor}, var(--shadow-sm)` }}
          >
            {person.imageUrl ? (
              // unoptimized: imageUrl may be an admin-entered URL to any
              // external host (see lib/validation/admin-person.ts) -- same
              // reasoning as recommendations-panel.tsx's own imageUrl.
              <Image
                src={person.imageUrl}
                alt={person.name}
                width={px * 2}
                height={px * 2}
                unoptimized
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center bg-[var(--accent-soft,var(--line-soft))] font-bold text-[var(--ink-soft)]"
                style={{ fontSize: px * 0.4 }}
                aria-hidden="true"
              >
                {person.name.trim().charAt(0)}
              </div>
            )}
          </div>
          <span
            className={cn(
              "pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-black px-3 py-1.5 text-xs font-bold text-white opacity-0 shadow-[var(--shadow-md)] transition-opacity duration-200 group-hover/avatar:opacity-100",
              tooltipSide === "top" ? "bottom-full mb-2" : "top-full mt-2",
            )}
          >
            {person.name}
          </span>
        </div>
      ))}
    </div>
  );
}
