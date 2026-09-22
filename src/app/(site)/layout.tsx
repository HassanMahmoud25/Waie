import type { ReactNode } from "react";
import { getSessionUser } from "@/lib/auth/server";
import { getSavedEpisodeIds } from "@/lib/library/saved-episodes";
import { getWatchProgress } from "@/lib/library/progress";
import { getUserNotes } from "@/lib/library/notes";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";
import { PageTransition } from "@/components/shared/page-transition";
import { SavedEpisodesProvider } from "@/components/library/saved-episodes-provider";
import { ProgressProvider } from "@/components/library/progress-provider";
import { NotesProvider } from "@/components/library/notes-provider";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  // Real, server-verified session (see lib/auth/server.ts) -- same helper /admin
  // uses. Passed down as a prop so the header (a Client Component, for its
  // scroll/menu interactivity) never has to read auth state itself.
  // getSessionUser() is request-memoized (React cache()), so calling it again
  // inside getSavedEpisodeIds()/getWatchProgress()/getUserNotes() below costs no
  // extra query -- four DB reads total per page load (user, saves, progress,
  // notes), not one per component/episode.
  const [sessionUser, savedEpisodeIds, watchProgress, notes] = await Promise.all([
    getSessionUser(),
    getSavedEpisodeIds(),
    getWatchProgress(),
    getUserNotes(),
  ]);
  const isAuthenticated = Boolean(sessionUser);

  return (
    <SavedEpisodesProvider initialSavedEpisodeIds={savedEpisodeIds} isAuthenticated={isAuthenticated}>
      <ProgressProvider initialProgress={watchProgress} isAuthenticated={isAuthenticated}>
        <NotesProvider initialNotes={notes} isAuthenticated={isAuthenticated}>
          <SiteHeader sessionUser={sessionUser} />
          <PageTransition>{children}</PageTransition>
          <SiteFooter />
        </NotesProvider>
      </ProgressProvider>
    </SavedEpisodesProvider>
  );
}
