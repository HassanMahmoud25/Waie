"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { adminNavItems, isAdminNavActive } from "@/components/admin/admin-nav";

/**
 * Bottom tab bar for the dashboard below `lg` — the site's own mobile tab bar
 * (same classes, same raised black active badge), fed by the admin routes.
 * Because it carries `.mobile-tab-bar`, the global player's dock automatically
 * sits above it (see `body:has(.mobile-tab-bar)` in media.css).
 */
export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-tab-bar lg:hidden" aria-label="التنقّل في لوحة الإدارة">
      <ul className="mobile-tab-bar__list mobile-tab-bar__list--fluid">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = isAdminNavActive(pathname, item);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn("mobile-tab-bar__link", isActive && "mobile-tab-bar__link--active")}
              >
                <span className="mobile-tab-bar__icon">
                  <Icon size={21} strokeWidth={isActive ? 2.3 : 1.8} aria-hidden="true" />
                </span>
                <span className="mobile-tab-bar__label">{item.shortLabel ?? item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
