/**
 * Site-wide constants: navigation, branding copy, and SEO defaults.
 * Centralised so components never hardcode nav links or the site name.
 */

export type NavLink = { label: string; href: string };

export const siteConfig = {
  name: "وعي",
  tagline: "حوارات عن الدين وما يشغلنا في حياتنا",
  defaultTitle: "وعي | حوارات عن الدين وما يشغلنا في حياتنا",
  description:
    "أحمد عامر وحازم الصديق وشريف علي يتحدثون عن الصلاة والتوبة والأخلاق، وعن سِيَر الصحابة وقصص الأنبياء ورمضان.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  /**
   * Waie's own podcast RSS feed (the source of every episode's audio -- see
   * lib/audio/podcast-feed.ts). Set PODCAST_FEED_URL to point elsewhere, or to an
   * empty string to turn Listen mode off.
   */
  podcastFeedUrl:
    process.env.PODCAST_FEED_URL ?? "https://feeds.soundcloud.com/users/soundcloud:users:1073536591/sounds.rss",
} as const;

export const primaryNav: NavLink[] = [
  { label: "الرئيسية", href: "/" },
  { label: "السلاسل", href: "/series" },
  { label: "المواضيع", href: "/topics" },
  { label: "المقدّمون", href: "/hosts" },
  { label: "المكتبة", href: "/library" },
];

export const footerNav: NavLink[] = [
  { label: "الرئيسية", href: "/" },
  { label: "السلاسل", href: "/series" },
  { label: "المواضيع", href: "/topics" },
  { label: "المكتبة", href: "/library" },
  { label: "المقدّمون", href: "/hosts" },
];

/** Waie's own official channel — the only platform social link that actually exists. */
export const youtubeChannelUrl = "https://www.youtube.com/@Waie";
