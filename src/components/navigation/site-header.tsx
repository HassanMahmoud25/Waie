"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Library, LogOut, Search, UserRound } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { primaryNav } from "@/config/site";
import { logoutAction } from "@/lib/auth/actions";
import type { SessionUser } from "@/lib/auth/server";
import { IconButton } from "@/components/ui/icon-button";
import { SearchModal } from "@/components/search/search-modal";
import { MobileTabBar } from "@/components/navigation/mobile-tab-bar";

const SCROLL_THRESHOLD = 12;
const MENU_TRANSITION_MS = 180;

export function SiteHeader({ sessionUser }: { sessionUser: SessionUser | null }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 px-3.5 pt-3 sm:px-6 sm:pt-4">
      <div
        className={cn(
          "site-header-bar mx-auto flex max-w-[1200px] items-center justify-between gap-4 rounded-[22px] px-4 transition-[height,box-shadow,background-color] duration-300 sm:px-6",
          isScrolled ? "h-[58px] shadow-[var(--shadow-md)]" : "h-[68px]",
        )}
      >
        <Link href="/" className="shrink-0" aria-label="وعي، الصفحة الرئيسية">
          <Image
            src="/brand/logo-deep.png"
            alt="وعي"
            width={125}
            height={100}
            priority
            className="h-8 w-auto brightness-0 sm:h-9"
          />
        </Link>

        <nav
          className="hidden items-center gap-7 text-[.84rem] font-bold lg:flex"
          aria-label="التنقّل الرئيسي"
        >
          {primaryNav.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-2 transition-colors",
                  isActive
                    ? "bg-black text-white"
                    : "text-[var(--ink-soft)] hover:text-black",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <IconButton aria-label="البحث" onClick={() => setIsSearchOpen(true)}>
            <Search size={18} />
          </IconButton>
          <HeaderAuth user={sessionUser} />
        </div>
      </div>

      <SearchModal open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <MobileTabBar />
    </header>
  );
}

function HeaderAuth({ user }: { user: SessionUser | null }) {
  const [isOpen, setIsOpen] = useState(false);
  // Keeps the menu in the DOM for the closing animation; the CSS drives the
  // open/close animation itself off the `data-state` attribute (see the
  // `.user-menu` keyframes in globals.css).
  const [shouldRender, setShouldRender] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      return;
    }
    const timeout = setTimeout(
      () => setShouldRender(false),
      MENU_TRANSITION_MS,
    );
    return () => clearTimeout(timeout);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node))
        setIsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("mousedown", onClickOutside);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  // Server-rendered from the real session (see (site)/layout.tsx) -- no
  // client-only hydration delay/flash the way a localStorage-derived value would have.
  if (!user) {
    return (
      <Link href="/login" className="btn-login">
        <UserRound size={16} /> الدخول
      </Link>
    );
  }

  const displayName = user.name?.trim() || user.email;
  const initial = displayName.charAt(0).toUpperCase() || "و";

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className="avatar-btn"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`حساب ${displayName}`}
        onClick={() => setIsOpen((open) => !open)}
      >
        {initial}
      </button>

      {shouldRender && (
        <div
          role="menu"
          data-state={isOpen ? "open" : "closed"}
          className="user-menu glass-strong"
        >
          <div className="border-b border-[var(--line-soft)] px-3 py-2.5">
            <p className="truncate text-sm font-black">{displayName}</p>
            <p className="truncate text-xs font-semibold text-[var(--muted)]">
              {user.email}
            </p>
          </div>
          <Link
            href="/library"
            role="menuitem"
            className="user-menu__item mt-1"
            onClick={() => setIsOpen(false)}
          >
            <Library size={16} /> مكتبتي
          </Link>
          {/* Real server logout (see lib/auth/actions.ts) -- the same action /admin's logout uses. */}
          <form action={logoutAction}>
            <button type="submit" role="menuitem" className="user-menu__item user-menu__item--danger w-full">
              <LogOut size={16} /> تسجيل الخروج
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
