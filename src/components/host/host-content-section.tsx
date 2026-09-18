import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import type { Host } from "@/types/host";
import type { HostProfile } from "@/data/host-profiles";
import { ContentRail } from "@/components/content/content-rail";
import { HostVideoCard } from "@/components/host/host-video-card";
import { Reveal } from "@/components/shared/reveal";

/** One host's rail of real videos pulled from their own channel — grouped under a small identity header so a reader always knows whose content they're scrolling through. */
export function HostContentSection({ host, profile }: { host: Host; profile: HostProfile }) {
  return (
    <Reveal>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative size-11 shrink-0 overflow-hidden rounded-full shadow-[var(--shadow-sm)]">
            <Image src={host.photoUrl} alt="" fill sizes="44px" className="object-cover" />
          </div>
          <div>
            <p className="text-xs font-bold text-[var(--muted)]">أبرز ما يقدّمه على قناته</p>
            <p className="text-lg font-black tracking-[-.02em]">{host.name}</p>
          </div>
        </div>
        <a href={profile.channelUrl} target="_blank" rel="noreferrer" className="section-link">
          زيارة القناة <ArrowLeft size={15} aria-hidden="true" />
        </a>
      </div>

      <ContentRail className="mt-6">
        {profile.videos.map((video) => (
          <div className="hover-rise" key={video.id}>
            <HostVideoCard video={video} />
          </div>
        ))}
      </ContentRail>
    </Reveal>
  );
}
