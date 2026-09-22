import type { ReactNode } from "react";
import { getSessionUser } from "@/lib/auth/server";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";
import { PageTransition } from "@/components/shared/page-transition";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  // Real, server-verified session (see lib/auth/server.ts) -- same helper /admin
  // uses. Passed down as a prop so the header (a Client Component, for its
  // scroll/menu interactivity) never has to read auth state itself.
  const sessionUser = await getSessionUser();

  return (
    <>
      <SiteHeader sessionUser={sessionUser} />
      <PageTransition>{children}</PageTransition>
      <SiteFooter />
    </>
  );
}
