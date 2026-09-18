"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Library, Mic2, Layers } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const tabs = [
  { label: "الرئيسية", href: "/", icon: Home },
  { label: "السلاسل", href: "/series", icon: Layers },
  { label: "المكتبة", href: "/library", icon: Library },
  { label: "المقدّمون", href: "/hosts", icon: Mic2 },
] as const;

/**
 * App-style bottom tab bar — replaces desktop-pattern navigation on mobile
 * (see SiteHeader, which renders this alongside itself and drops its own
 * hamburger menu below `lg`). Rendered only on consumer-facing pages since
 * it lives inside SiteHeader, which admin/auth screens never mount.
 */
export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="mobile-tab-bar lg:hidden" aria-label="التنقّل الرئيسي">
      <ul className="mobile-tab-bar__list">
        {tabs.map(({ label, href, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="mobile-tab-bar__item">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn("mobile-tab-bar__link", isActive && "mobile-tab-bar__link--active")}
              >
                <span className="mobile-tab-bar__icon">
                  <Icon size={22} strokeWidth={isActive ? 2.3 : 1.8} aria-hidden="true" />
                </span>
                <span className="mobile-tab-bar__label">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
