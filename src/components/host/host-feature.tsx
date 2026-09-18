import Image from "next/image";
import { ExternalLink, Users } from "lucide-react";
import type { Host } from "@/types/host";
import type { HostProfile } from "@/data/host-profiles";
import { Reveal } from "@/components/shared/reveal";
import { cn } from "@/lib/utils/cn";

const ORDINALS = ["الصوت الأول", "الصوت الثاني", "الصوت الثالث"];

type HostFeatureProps = {
  host: Host;
  profile: HostProfile;
  index: number;
  /** Each host gets its own rectangular photo treatment — never circular, so the three read as one consistent editorial layout rather than a mismatched "team page" card. */
  variant: "cinematic" | "card";
  /** Which side the photo sits on, set per host (not derived from index) so two sections sharing a variant still don't mirror each other identically. */
  reverse?: boolean;
};

/** Shared bio content: eyebrow, name, bio copy, pillar list, role line, and the channel link — identical across variants, only the image side changes shape. */
function HostFeatureBody({ host, profile, index }: Pick<HostFeatureProps, "host" | "profile" | "index">) {
  return (
    <div className="host-feature__body min-w-0">
      <p className="eyebrow-pill w-fit">{ORDINALS[index] ?? "أحد أصوات وعي"}</p>
      <h2 className="mt-4 text-2xl font-black leading-[1.25] tracking-[-.02em] sm:text-4xl">{host.name}</h2>
      <p className="mt-5 max-w-xl text-base leading-8 text-[var(--ink-soft)] sm:text-lg">{profile.bio}</p>

      <div className="mt-7 flex flex-col gap-3 sm:max-w-xl">
        {profile.pillars.map((pillar) => (
          <div className="host-pillar" key={pillar.title}>
            <p className="text-[.95rem] font-black">{pillar.title}</p>
            <p className="text-sm leading-7 text-[var(--ink-soft)]">{pillar.description}</p>
          </div>
        ))}
      </div>

      <p className="mt-6 max-w-xl text-sm font-bold leading-7 text-[var(--accent-strong)]">{profile.roleInWaie}</p>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <a
          href={profile.channelUrl}
          target="_blank"
          rel="noreferrer"
          className="btn btn-secondary"
        >
          {profile.channelHandle} على يوتيوب <ExternalLink size={15} aria-hidden="true" />
        </a>
        <span className="chip">
          <Users size={14} aria-hidden="true" /> {profile.subscribers} مشترك
        </span>
      </div>
    </div>
  );
}

export function HostFeature({ host, profile, index, variant, reverse = false }: HostFeatureProps) {
  return (
    <Reveal className={cn("host-feature", reverse && "host-feature--reverse")}>
      {variant === "cinematic" && (
        <div className="host-feature__media host-cinematic">
          <div className="host-cinematic__media">
            <Image src={host.photoUrl} alt={host.name} fill sizes="(max-width: 900px) 100vw, 46vw" className="object-cover" />
            <span className="scrim" aria-hidden="true" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <p className="glass-dark w-fit rounded-[var(--radius-pill)] px-4 py-1.5 text-xs font-bold">
                {profile.videoCount} فيديو على القناة
              </p>
            </div>
          </div>
        </div>
      )}

      {variant === "card" && (
        <div className="host-feature__media">
          <div className="host-portrait-card">
            <Image src={host.photoUrl} alt={host.name} fill sizes="(max-width: 900px) 100vw, 42vw" className="object-cover" />
            <span className="scrim" aria-hidden="true" />
            <span className="host-portrait-card__stat glass-strong rounded-[var(--radius-pill)] px-4 py-2 text-xs font-bold">
              {profile.subscribers} مشترك · {profile.videoCount} فيديو
            </span>
          </div>
        </div>
      )}

      <HostFeatureBody host={host} profile={profile} index={index} />
    </Reveal>
  );
}
