import Image from "next/image";
import type { CSSProperties } from "react";
import { hosts } from "@/data/hosts";
import { hostProfiles } from "@/data/host-profiles";

/** Same purely-decorative per-host accent used on the homepage collage (components/host/hosts-showcase.tsx) — kept here too so the two portrait treatments read as one visual language across the site. */
const HOST_GLOW: Record<string, string> = {
  "ahmed-amer": "#d6ad70",
  "hazem-elseddiq": "#7ea89b",
  "sherif-ali": "#91a4c2",
};

const HOST_LIFT: Record<string, string> = {
  "ahmed-amer": "sm:translate-y-4",
  "hazem-elseddiq": "sm:-translate-y-6",
  "sherif-ali": "sm:translate-y-8",
};

/**
 * The /hosts page's cinematic opener: the same overlapping-portrait idea as
 * the homepage's HostsShowcase, but staged on a dark cinematic band (rather
 * than the light canvas) with larger portraits and a combined-audience stat
 * row beneath — the "three people, one show" statement before the page
 * breaks them out individually below.
 */
export function HostsHero() {
  const totalVideos = Object.values(hostProfiles).reduce(
    (sum, profile) => sum + Number(profile.videoCount.replace(/[^\d]/g, "")),
    0,
  );

  return (
    <section className="relative -mt-[80px] overflow-hidden bg-[var(--cinematic)] pb-16 pt-32 sm:-mt-[84px] sm:pb-24 sm:pt-40">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(70vw 60vh at 15% -5%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 62%), radial-gradient(65vw 55vh at 90% 10%, color-mix(in srgb, var(--brand) 30%, transparent), transparent 60%)",
        }}
        aria-hidden="true"
      />

      <div className="container relative text-center text-white">
        <p className="eyebrow-pill eyebrow-pill--on-dark mx-auto w-fit">أصوات وعي</p>
        <h1 className="mx-auto mt-6 max-w-3xl text-3xl font-black leading-[1.25] tracking-[-.03em] sm:text-5xl md:text-6xl">
          ثلاثة أصوات، حوار واحد
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-[var(--on-brand-soft)] sm:text-lg">
          أحمد عامر، شريف علي، وحازم الصديق — ثلاثة صنّاع محتوى لكل منهم قناته ورحلته الخاصة، يجتمعون أسبوعيًا خلف ميكروفون
          واحد ليصنعوا وعي.
        </p>
      </div>

      <div className="container relative mt-14 flex flex-col items-center gap-12 sm:mt-20 sm:flex-row sm:items-end sm:justify-center sm:gap-0">
        {hosts.map((host, index) => (
          <div
            className={`flex flex-col items-center text-center ${HOST_LIFT[host.id] ?? ""} ${
              index === 0 ? "sm:-me-6" : index === 2 ? "sm:-ms-6" : "sm:z-10"
            }`}
            key={host.id}
          >
            <div
              className="host-portrait host-portrait--xl"
              style={{ "--host-glow": HOST_GLOW[host.id] } as CSSProperties}
            >
              <span className="host-portrait__glow" aria-hidden="true" />
              <div className="host-portrait__frame">
                <Image
                  src={host.photoUrl}
                  alt={host.name}
                  fill
                  sizes="(max-width: 640px) 60vw, 260px"
                  priority={index === 1}
                  className="object-cover"
                />
              </div>
            </div>
            <p className="mt-5 text-xl font-black tracking-[-.02em] text-white sm:text-2xl">{host.name}</p>
            <span
              className="mt-2 h-[3px] w-10 rounded-full"
              style={{ backgroundColor: HOST_GLOW[host.id] }}
              aria-hidden="true"
            />
          </div>
        ))}
      </div>

      <div className="container relative mt-16">
        <div className="glass-dark mx-auto flex w-fit flex-wrap items-center justify-center gap-x-10 gap-y-4 rounded-[var(--radius-pill)] px-8 py-5 text-center">
          <div>
            <b className="block text-2xl font-black text-white">٣</b>
            <span className="text-xs text-[var(--on-brand-soft)]">أصوات</span>
          </div>
          <div>
            <b className="block text-2xl font-black text-white">2.68M+</b>
            <span className="text-xs text-[var(--on-brand-soft)]">مشترك عبر قنواتهم</span>
          </div>
          <div>
            <b className="block text-2xl font-black text-white">{totalVideos.toLocaleString("en-US")}+</b>
            <span className="text-xs text-[var(--on-brand-soft)]">فيديو منشور على قنواتهم الشخصية</span>
          </div>
        </div>
      </div>
    </section>
  );
}
