import { FolderOpen, Headphones, Layers, LayoutDashboard, RefreshCw, Tag, type LucideIcon } from "lucide-react";

export type AdminNavItem = {
  label: string;
  /** Shorter label for the mobile tab bar, where each tab is ~60px wide. */
  shortLabel?: string;
  href: string;
  icon: LucideIcon;
  /** Match the path exactly (the overview) instead of by prefix. */
  exact?: boolean;
};

export type AdminNavGroup = { label: string | null; items: AdminNavItem[] };

/**
 * Icons match the ones the public site already uses for the same concepts
 * (episodes = headphones, series = layers, topics = tag; see hero stats and
 * the mobile tab bar), so the two halves of the product speak one language.
 */
export const adminNav: AdminNavGroup[] = [
  {
    label: null,
    items: [{ label: "نظرة عامة", href: "/admin", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "المحتوى",
    items: [
      { label: "الحلقات", href: "/admin/episodes", icon: Headphones },
      { label: "السلاسل", href: "/admin/series", icon: Layers },
      { label: "المواضيع", href: "/admin/topics", icon: Tag },
      { label: "المختارات", href: "/admin/collections", icon: FolderOpen },
    ],
  },
  {
    label: "الأدوات",
    items: [{ label: "مزامنة يوتيوب", shortLabel: "المزامنة", href: "/admin/sync/youtube", icon: RefreshCw }],
  },
];

export const adminNavItems = adminNav.flatMap((group) => group.items);

export function isAdminNavActive(pathname: string, item: AdminNavItem) {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}
