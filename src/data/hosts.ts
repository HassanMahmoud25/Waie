import type { Host } from "@/types/host";

/**
 * Waie's three recurring hosts, per the channel's own bio ("بودكاست وعي مع
 * حازم الصديق، أحمد عامر وشريف علي"). Real portraits, stored under
 * public/hosts/.
 */
export const hosts: Host[] = [
  {
    id: "ahmed-amer",
    slug: "ahmed-amer",
    name: "أحمد عامر",
    photoUrl: "/hosts/ahmed-amer.jpg",
  },
  {
    id: "hazem-elseddiq",
    slug: "hazem-elseddiq",
    name: "حازم الصديق",
    photoUrl: "/hosts/hazem-elseddiq.jpg",
  },
  {
    id: "sherif-ali",
    slug: "sherif-ali",
    name: "شريف علي",
    photoUrl: "/hosts/sherif-ali.jpg",
  },
];

/**
 * The show's default lineup — used whenever an episode doesn't specify its
 * own `hosts` array (see types/episode.ts + lib/utils/content.ts). Every
 * episode imported from YouTube metadata currently falls into this default,
 * since who specifically appears in any one of the 113 episodes isn't
 * something derivable from channel metadata (title/description/duration) —
 * only from actually watching each one, which is out of scope for the
 * content import. An editor can narrow `hosts` per episode later (e.g. a
 * solo or guest-takeover episode) without any change to this component
 * system.
 */
export const defaultHostIds = hosts.map((host) => host.id);
