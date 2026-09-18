import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";

/**
 * Shared split-card shell for /login, /signup and /forgot-password: a
 * cinematic brand panel beside the actual form panel. Below 900px the panel
 * becomes a banner stacked above the form and swaps to the mobile-cropped
 * hero photo (all three hosts) instead of the wide desktop crop. Keeps the
 * three auth screens visually consistent without duplicating the layout
 * markup in each page.
 */
export function AuthShell({
  eyebrow,
  title,
  subtitle,
  quote,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  quote: string;
  children: ReactNode;
}) {
  return (
    <div className="auth-page">
      <div className="auth-card glass-strong">
        <aside className="auth-card__brand">
          <div className="auth-card__brand-media">
            <Image
              src="/brand/hero-stage-mobile.jpg"
              alt=""
              fill
              sizes="(min-width: 900px) 0px, 480px"
              priority
              className="auth-card__brand-photo auth-card__brand-photo--mobile"
            />
            <Image
              src="/brand/hero-stage-mobile.jpg"
              alt=""
              fill
              sizes="(min-width: 900px) 480px, 0px"
              priority
              className="auth-card__brand-photo auth-card__brand-photo--desktop"
            />
          </div>

          <Link href="/" className="w-fit" aria-label="وعي، الصفحة الرئيسية">
            <Image
              src="/brand/logo-white.png"
              alt="وعي"
              width={125}
              height={100}
              className="h-9 w-auto"
            />
          </Link>

          <div className="flex flex-col gap-4">
            <span className="eyebrow-pill eyebrow-pill--on-dark w-fit">
              {siteConfig.tagline}
            </span>
            <p className="auth-card__quote">{quote}</p>
          </div>
        </aside>

        <div className="auth-card__form">
          <p className="eyebrow-pill w-fit">{eyebrow}</p>
          <h1 className="mt-4 text-[1.8rem] font-black tracking-[-.03em] sm:text-[2.1rem]">
            {title}
          </h1>
          <p className="mt-2 text-sm font-semibold leading-7 text-(--ink-soft)">
            {subtitle}
          </p>

          <div className="mt-7">{children}</div>
        </div>
      </div>
    </div>
  );
}
