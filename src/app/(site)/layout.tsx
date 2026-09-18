import type { ReactNode } from "react";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";
import { AudioPlaybackBridge } from "@/components/episode/audio-playback-bridge";
import { PageTransition } from "@/components/shared/page-transition";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AudioPlaybackBridge />
      <SiteHeader />
      <PageTransition>{children}</PageTransition>
      <SiteFooter />
    </>
  );
}
