"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpLeft, Globe, LogOut } from "lucide-react";
import { logoutAction } from "@/lib/auth/actions";
import { adminNav, isAdminNavActive } from "@/components/admin/admin-nav";

/**
 * Desktop navigation: a floating frosted-glass panel (the same surface as the
 * landing page's header bar) with grouped links. Hidden below `lg`, where the
 * top bar + bottom tab bar take over (see admin-topbar / admin-mobile-nav).
 */
export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar site-header-bar">
      <div className="admin-sidebar__brand">
        <Link href="/admin" aria-label="وعي، لوحة الإدارة" className="shrink-0">
          <Image
            src="/brand/logo-deep.png"
            alt="وعي"
            width={125}
            height={100}
            priority
            className="h-9 w-auto brightness-0"
          />
        </Link>
        <span className="eyebrow-pill px-3 py-1.5 text-[.68rem]">الإدارة</span>
      </div>

      <nav className="admin-sidebar__scroll" aria-label="التنقّل في لوحة الإدارة">
        {adminNav.map((group, index) => (
          <div key={group.label ?? index}>
            {group.label && <p className="admin-nav__label">{group.label}</p>}
            <ul className={`admin-nav__list ${group.label ? "" : "mt-3"}`}>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = isAdminNavActive(pathname, item);
                return (
                  <li key={item.href}>
                    <Link href={item.href} aria-current={isActive ? "page" : undefined} className="admin-nav__link">
                      <Icon size={19} strokeWidth={isActive ? 2.2 : 1.9} aria-hidden="true" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="admin-sidebar__footer">
        <Link href="/" className="admin-nav__link">
          <Globe size={19} strokeWidth={1.9} aria-hidden="true" />
          عرض الموقع
          <ArrowUpLeft size={15} className="admin-nav__trailing" aria-hidden="true" />
        </Link>
        <form action={logoutAction}>
          <button type="submit" className="admin-nav__link w-full">
            <LogOut size={19} strokeWidth={1.9} aria-hidden="true" />
            تسجيل الخروج
          </button>
        </form>
      </div>
    </aside>
  );
}
