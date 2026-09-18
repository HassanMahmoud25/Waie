import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowLeft, Headphones, Layers, Play, Tag } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Episode } from "@/types/episode";
import { siteConfig } from "@/config/site";

export type HeroStatKey = "episodes" | "series" | "topics";

const heroStatIcons: Record<HeroStatKey, LucideIcon> = {
  episodes: Headphones,
  series: Layers,
  topics: Tag,
};

/**
 * The homepage hero: an introduction to وعي itself -- what the platform is
 * and how much is inside it -- not a promo for one specific episode. A
 * single episode's title/description doesn't represent "the site and its
 * content" the way the tagline + real stats + a way into both the latest
 * episode and the full catalog does.
 *
 * Structurally this is unchanged from the previous per-episode hero (still
 * a true full-viewport (100svh) cinematic slab pulled up under the floating
 * glass header via the same negative margin -- see SiteHeader: `h-[68px]` +
 * a 1px bottom border = 69px). Only the *content* is now about the site.
 *
 * The background is a fixed brand photo (a real Waie stage event), swapped
 * out independently of any episode data -- update HERO_IMAGE to change it.
 * HERO_IMAGE_MOBILE is a portrait crop shown below the `md` breakpoint,
 * since the landscape HERO_IMAGE crops awkwardly on narrow viewports.
 */
const HERO_IMAGE = "/brand/hero-stage.jpg";
const HERO_IMAGE_MOBILE = "/brand/hero-stage-mobile.jpg";
const HERO_IMAGE_ALT = "جلسة حوارية على خشبة المسرح في أحد لقاءات وعي أمام جمهور حاشد";

export function SiteHero({
  stats,
  latestEpisode,
}: {
  stats?: { key: HeroStatKey; label: string; value: string }[];
  latestEpisode?: Episode | null;
}) {
  return (
    <section className="relative -mt-[80px] w-full overflow-hidden bg-[var(--cinematic)] sm:-mt-[84px]">
      <div className="relative h-[100svh] min-h-[420px] w-full">
        <Image
          src={HERO_IMAGE_MOBILE}
          alt={HERO_IMAGE_ALT}
          fill
          priority
          sizes="100vw"
          className="hero-image-in hero-drift object-cover md:hidden"
        />
        <Image
          src={HERO_IMAGE}
          alt={HERO_IMAGE_ALT}
          fill
          priority
          sizes="100vw"
          className="hero-image-in hero-drift hidden object-cover md:block"
        />
        <span className="scrim" aria-hidden="true" />
        <span
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(60% 50% at 85% 15%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 70%)",
          }}
          aria-hidden="true"
        />
      </div>

      <div className="container absolute inset-x-0 bottom-0 pb-[var(--mobile-nav-clearance)] text-white lg:pb-20">
        <p
          className="glass-dark glass-pill home-eyebrow--on-dark hero-in mt-5 px-4 py-1.5 text-xs"
          style={{ "--hero-delay": "0.08s" } as CSSProperties}
        >
          منصة معرفية عربية
        </p>

        <h1
          className="hero-title hero-in mt-4 max-w-2xl text-balance text-3xl font-black leading-[1.3] tracking-[-.02em] sm:text-4xl sm:leading-[1.25] sm:tracking-[-.03em] md:text-5xl"
          style={{ "--hero-delay": "0.16s" } as CSSProperties}
        >
          {siteConfig.tagline}
        </h1>

        <p
          className="hero-in mt-4 max-w-xl text-sm leading-7 text-[var(--on-brand-soft)] sm:text-base md:line-clamp-2"
          style={{ "--hero-delay": "0.24s" } as CSSProperties}
        >
          {siteConfig.description}
        </p>

        <div
          className="hero-in mt-6 flex flex-wrap items-center gap-2.5 sm:gap-3"
          style={{ "--hero-delay": "0.32s" } as CSSProperties}
        >
          {latestEpisode && (
            <Link href={`/episodes/${latestEpisode.slug}`} className="btn btn-glass--solid">
              <Play size={16} fill="currentColor" />
              استمع لأحدث حلقة
            </Link>
          )}
          <Link href="/series" className="btn btn-glass">
            تصفّح كل السلاسل
            <ArrowLeft size={16} />
          </Link>
        </div>

        {stats && stats.length > 0 && (
          <div
            className="hero-stats hero-in glass-dark mt-8"
            style={{ "--hero-delay": "0.4s" } as CSSProperties}
          >
            {stats.map((stat) => {
              const Icon = heroStatIcons[stat.key];
              return (
                <div className="hero-stat" key={stat.key}>
                  <Icon className="hero-stat__icon" size={18} aria-hidden="true" />
                  <div>
                    <b>{stat.value}</b>
                    <span>{stat.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
