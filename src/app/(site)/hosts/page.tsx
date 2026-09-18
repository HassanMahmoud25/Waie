import type { Metadata } from "next";
import { Reveal } from "@/components/shared/reveal";
import { HostsHero } from "@/components/host/hosts-hero";
import { HostFeature } from "@/components/host/host-feature";
import { HostContentSection } from "@/components/host/host-content-section";
import { WaieConnection } from "@/components/host/waie-connection";
import { hosts } from "@/data/hosts";
import { hostProfiles } from "@/data/host-profiles";

export const metadata: Metadata = {
  title: "المقدّمون",
  description:
    "تعرّف على أحمد عامر وشريف علي وحازم الصديق، المقدّمون الثلاثة خلف بودكاست وعي — من هم، وماذا يصنعون على قنواتهم الخاصة.",
};

/**
 * Per-host photo treatment — set explicitly per host id (not derived from
 * array index) so Ahmed Amer's section reads as consistently rectangular
 * with Hazem's and Sherif's, rather than the one circular portrait among
 * three photo cards.
 */
const HOST_LAYOUT: Record<string, { variant: "cinematic" | "card"; reverse?: boolean }> = {
  "ahmed-amer": { variant: "card", reverse: true },
  "hazem-elseddiq": { variant: "cinematic" },
  "sherif-ali": { variant: "card", reverse: true },
};

export default function HostsPage() {
  return (
    <main>
      <HostsHero />

      <section className="section">
        <div className="container">
          <Reveal className="mx-auto max-w-xl text-center">
            <span className="home-eyebrow">قابل المقدّمون</span>
            <h2 className="mt-3 text-2xl font-black leading-[1.25] tracking-[-.02em] sm:text-3xl">من هم خلف الميكروفون</h2>
            <p className="mt-3 leading-7 text-[var(--ink-soft)]">
              لكل واحد منهم قناته الخاصة وجمهوره الذي بناه على مدى سنوات، قبل أن يجتمعوا معًا في وعي.
            </p>
          </Reveal>

          <div className="mt-16 flex flex-col gap-20 sm:gap-28">
            {hosts.map((host, index) => {
              const profile = hostProfiles[host.id];
              const layout = HOST_LAYOUT[host.id];
              if (!profile || !layout) return null;
              return (
                <HostFeature
                  host={host}
                  profile={profile}
                  index={index}
                  variant={layout.variant}
                  reverse={layout.reverse}
                  key={host.id}
                />
              );
            })}
          </div>
        </div>
      </section>

      <section className="section section-tint pt-0">
        <div className="container">
          <Reveal className="mx-auto max-w-xl text-center">
            <span className="home-eyebrow">محتواهم الشخصي</span>
            <h2 className="mt-3 text-2xl font-black leading-[1.25] tracking-[-.02em] sm:text-3xl">ماذا يصنعون على قنواتهم</h2>
            <p className="mt-3 leading-7 text-[var(--ink-soft)]">
              محتوى حقيقي من قنوات المقدّمون الثلاثة — ليس من حلقات وعي، بل مما يصنعونه بشكل مستقل.
            </p>
          </Reveal>

          <div className="mt-14 flex flex-col gap-16">
            {hosts.map((host) => {
              const profile = hostProfiles[host.id];
              if (!profile) return null;
              return <HostContentSection host={host} profile={profile} key={host.id} />;
            })}
          </div>
        </div>
      </section>

      <WaieConnection />
    </main>
  );
}
