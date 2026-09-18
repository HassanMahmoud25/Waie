import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Users } from "lucide-react";
import type { Host } from "@/types/host";
import type { HostProfile } from "@/data/host-profiles";

/**
 * Portrait discovery tile for a host — built on the same aspect/radius/shadow
 * shape as `.host-portrait-card` (see the /hosts page's host-feature.tsx),
 * but with SeriesCard's bottom-anchored text treatment so it reads as part
 * of that same cinematic-photo family. Links straight into that host's
 * section of /hosts (see the `id` added in host-feature.tsx).
 */
export function HostDiscoverCard({ host, profile }: { host: Host; profile: HostProfile }) {
  return (
    <Link href={`/hosts#${host.id}`} className="hover-zoom group relative block">
      <div className="host-portrait-card">
        <Image
          src={host.photoUrl}
          alt={host.name}
          fill
          sizes="(max-width: 1024px) 90vw, 30vw"
          className="object-cover"
        />
        <span className="scrim" aria-hidden="true" />

        <div className="relative flex h-full flex-col justify-between p-5 text-white sm:p-6">
          <p className="eyebrow-pill eyebrow-pill--on-dark w-fit text-[.68rem]">مقدّم</p>

          <div>
            <h3 className="text-2xl font-black tracking-[-.03em] sm:text-3xl">{host.name}</h3>
            <p className="mt-2 max-w-xs text-sm leading-6 text-[var(--on-brand-soft)]">{profile.roleInWaie}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="glass-dark inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-3 py-1.5 text-xs font-bold">
                <Users size={12} aria-hidden="true" /> {profile.subscribers}
              </span>
              <span className="glass-dark inline-flex w-fit items-center gap-1.5 rounded-[var(--radius-pill)] px-3.5 py-1.5 text-xs font-bold transition-[gap] group-hover:gap-2.5">
                استكشف محتواه <ChevronLeft size={13} aria-hidden="true" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
