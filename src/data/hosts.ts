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
