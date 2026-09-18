import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { CSSProperties } from "react";
import { hosts } from "@/data/hosts";
import { Reveal } from "@/components/shared/reveal";
import { cn } from "@/lib/utils/cn";

/**
 * Purely decorative per-host accent — picked from the same muted palette
 * already used for topic tiles (data/topics.ts), so the halo behind each
 * portrait reads as part of the same visual language rather than a new
 * color system. Not tied to any real attribute of the person.
 */
const HOST_GLOW: Record<string, string> = {
  "ahmed-amer": "#d6ad70",
  "hazem-elseddiq": "#7ea89b",
  "sherif-ali": "#91a4c2",
};

/** The middle host floats higher/larger; the outer two sit lower — an asymmetric arrangement instead of a flat row of identical cards. */
const HOST_LIFT: Record<string, string> = {
  "ahmed-amer": "sm:translate-y-6",
  "hazem-elseddiq": "sm:-translate-y-4",
  "sherif-ali": "sm:translate-y-10",
};

/**
 * The homepage's editorial introduction to Waie's three hosts — a floating,
 * asymmetric collage of real portraits (not a "Team" grid). Each portrait
 * gets its own colored glow halo; the halos are pulled close enough to
 * blend into each other at the edges, giving a sense of "overlap" without
 * ever cropping into a neighboring face.
 */
export function HostsShowcase() {
  return (
    <section className="section pt-0 relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(760px 520px at 12% 15%, color-mix(in srgb, var(--accent) 13%, transparent), transparent 65%), radial-gradient(700px 500px at 88% 75%, color-mix(in srgb, var(--brand) 11%, transparent), transparent 65%)",
        }}
        aria-hidden="true"
      />

      <div className="container relative pt-10">
        <Reveal className="mx-auto max-w-xl text-center">
          <span className="home-eyebrow">أصوات وعي</span>
          <h2 className="mt-3 text-2xl font-black leading-[1.25] tracking-[-.02em] sm:text-3xl">
            المقدّمون خلف كل حلقة
          </h2>
          <p className="mt-3 leading-7 text-[var(--ink-soft)]">
            ثلاثة أصوات يجمعهم فضول واحد نحو المعرفة، يقودون الحوار حلقة بعد
            حلقة.
          </p>
        </Reveal>

        <div className="mt-16 flex flex-col items-center gap-14 sm:flex-row sm:items-end sm:justify-center sm:gap-0">
          {hosts.map((host, index) => {
            const isCenter = index === 1;
            return (
              <Reveal
                delayMs={index * 120}
                key={host.id}
                className={cn(
                  "flex flex-col items-center text-center",
                  HOST_LIFT[host.id],
                  index === 0 && "sm:-me-8",
                  index === 2 && "sm:-ms-8",
                  isCenter && "sm:z-10",
                )}
              >
                <div
                  className={cn(
                    "host-portrait",
                    isCenter ? "host-portrait--lg" : "host-portrait--sm",
                  )}
                  style={{ "--host-glow": HOST_GLOW[host.id] } as CSSProperties}
                >
                  <span className="host-portrait__glow" aria-hidden="true" />
                  <div className="host-portrait__frame">
                    <Image
                      src={host.photoUrl}
                      alt={host.name}
                      fill
                      sizes="(max-width: 640px) 55vw, 280px"
                      className="object-cover"
                    />
                  </div>
                </div>

                <p className="mt-5 text-xl font-black tracking-[-.02em]">
                  {host.name}
                </p>
                <span
                  className="mt-2 h-[3px] w-10 rounded-full"
                  style={{ backgroundColor: HOST_GLOW[host.id] }}
                  aria-hidden="true"
                />
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-20 flex justify-center">
          <Link href="/hosts" className="btn btn-secondary">
            تعرّف على المقدّمون <ArrowLeft size={15} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
