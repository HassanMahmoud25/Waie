import Image from "next/image";
import Link from "next/link";
import { ArrowUpLeft } from "lucide-react";
import { footerNav, siteConfig, youtubeChannelUrl } from "@/config/site";
import { contentRepository } from "@/lib/repositories";
import { hosts } from "@/data/hosts";
import { Reveal } from "@/components/shared/reveal";
import { YoutubeGlyph } from "@/components/icons/platform-glyphs";
import type { SeriesWithStats } from "@/types/series";

/** The whole catalog is a handful of series, so the footer lists all of them, most active first. */
async function getFeaturedSeries(): Promise<SeriesWithStats[]> {
  const series = await contentRepository.listSeries();
  return series
    .filter((s) => s.status === "PUBLISHED" && s.episodeCount > 0)
    .sort((a, b) => b.episodeCount - a.episodeCount);
}

export async function SiteFooter() {
  const featuredSeries = await getFeaturedSeries();

  return (
    <footer className="relative overflow-hidden bg-[var(--cinematic)] text-[var(--on-brand-soft)]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(760px 460px at 14% 0%, color-mix(in srgb, var(--brand) 42%, transparent), transparent 65%), radial-gradient(620px 420px at 90% 15%, color-mix(in srgb, var(--accent) 24%, transparent), transparent 65%), radial-gradient(900px 500px at 50% 100%, color-mix(in srgb, var(--brand-deep) 55%, transparent), transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Closing brand statement */}
      <div className="container relative pt-20 pb-14 text-center md:pt-28 md:pb-18">
        <Reveal className="mx-auto flex max-w-3xl flex-col items-center">
          <p className="eyebrow-pill eyebrow-pill--on-dark w-fit">وعي</p>
          <h2 className="mt-6 text-2xl leading-[1.8] font-black tracking-[-.02em] text-white md:text-3xl">
            اكتشف وعي، واستكشف الحكايات
            <br className="hidden sm:block" /> والأفكار{" "}
            <span className="bg-gradient-to-l from-[var(--on-brand-accent)] to-[var(--accent)] bg-clip-text text-transparent">
              التي تستحق أن تُروى.
            </span>
          </h2>
        </Reveal>
      </div>

      <div
        className="relative h-px bg-gradient-to-l from-transparent via-white/15 to-transparent"
        aria-hidden="true"
      />

      {/* Mobile layout: brand, then two compact columns, then a hosts row */}
      <div className="container relative grid gap-10 py-14 md:hidden">
        <BrandBlock />
        <div className="grid grid-cols-2 gap-8">
          <FooterSection title="استكشف">
            <LinkList items={footerNav} />
          </FooterSection>
          {featuredSeries.length > 0 && (
            <FooterSection title="سلاسل وعي">
              <LinkList
                items={featuredSeries.map((s) => ({
                  label: s.title,
                  href: `/series/${s.slug}`,
                }))}
              />
            </FooterSection>
          )}
        </div>
        <FooterSection title="المقدّمون">
          <div className="flex items-center gap-5">
            {hosts.map((host) => (
              <Link
                key={host.id}
                href="/hosts"
                className="group flex flex-col items-center gap-2"
                aria-label={host.name}
              >
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-1 ring-white/15 transition-[box-shadow,transform] duration-300 group-hover:scale-105 group-hover:ring-[var(--accent)]/60">
                  <Image
                    src={host.photoUrl}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </span>
                <span className="text-[.72rem] font-bold text-[var(--on-brand-soft)] group-hover:text-[var(--on-brand-accent)]">
                  {host.name.split(" ")[0]}
                </span>
              </Link>
            ))}
          </div>
        </FooterSection>
        <FooterSection title="تابع وعي">
          <FollowLink />
        </FooterSection>
      </div>

      {/* Desktop layout */}
      <div className="container relative hidden gap-10 py-16 md:grid md:grid-cols-[1.3fr_0.85fr_1fr_1.1fr_1fr] lg:gap-8">
        <BrandBlock />
        <FooterSection title="استكشف">
          <LinkList items={footerNav} />
        </FooterSection>
        {featuredSeries.length > 0 && (
          <FooterSection title="سلاسل وعي">
            <LinkList
              items={featuredSeries.map((s) => ({
                label: s.title,
                href: `/series/${s.slug}`,
              }))}
            />
          </FooterSection>
        )}
        <FooterSection title="المقدّمون">
          <ul className="flex flex-col gap-4">
            {hosts.map((host) => (
              <li key={host.id}>
                <Link href="/hosts" className="group flex items-center gap-3">
                  <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-1 ring-white/15 transition-[box-shadow,transform] duration-300 group-hover:scale-105 group-hover:ring-[var(--accent)]/60">
                    <Image
                      src={host.photoUrl}
                      alt=""
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  </span>
                  <span className="text-sm font-bold transition-colors group-hover:text-[var(--on-brand-accent)]">
                    {host.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </FooterSection>
        <FooterSection title="تابع وعي">
          <FollowLink />
        </FooterSection>
      </div>

      <div className="relative">
        <div
          className="h-px bg-gradient-to-l from-transparent via-white/15 to-transparent"
          aria-hidden="true"
        />
        <div className="container flex flex-col-reverse items-center gap-4 pt-7 pb-[calc(1.75rem+var(--mobile-nav-clearance))] text-xs opacity-70 sm:flex-row sm:items-center sm:justify-between lg:pb-7">
          <span>
            © {new Date().getFullYear()} {siteConfig.name}. جميع الحقوق محفوظة.
          </span>
          <Link
            href={youtubeChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
          >
            <YoutubeGlyph className="h-3.5 w-3.5" />
            YouTube
          </Link>
        </div>
      </div>
    </footer>
  );
}

function BrandBlock() {
  return (
    <div>
      <Image
        src="/brand/logo-white.png"
        alt={siteConfig.name}
        width={125}
        height={100}
        className="h-11 w-auto"
      />
      <p className="mt-5 max-w-xs text-[.95rem] leading-8">
        وعي — مساحة لاكتشاف الأفكار، القصص، والتجارب التي تستحق أن تُروى.
      </p>
      <Link
        href="/series"
        className="glass-dark mt-7 inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-5 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
      >
        استكشف وعي <ArrowUpLeft size={15} aria-hidden="true" />
      </Link>
    </div>
  );
}

function FollowLink() {
  return (
    <Link
      href={youtubeChannelUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="glass-dark inline-flex w-fit items-center gap-2.5 rounded-[var(--radius-pill)] px-5 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
    >
      <YoutubeGlyph className="h-4 w-4" />
      قناة وعي
    </Link>
  );
}

function FooterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="eyebrow eyebrow--on-dark">{title}</h3>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function LinkList({ items }: { items: { label: string; href: string }[] }) {
  return (
    <ul className="flex flex-col gap-3.5 text-sm font-bold">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className="transition-colors hover:text-[var(--on-brand-accent)]"
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
