import type { ReactNode } from "react";
import { getSessionUser } from "@/lib/auth/server";
import { getSavedEpisodeIds } from "@/lib/library/saved-episodes";
import { getWatchProgress } from "@/lib/library/progress";
import { getUserNotes } from "@/lib/library/notes";
import { getFollowedSeriesIds } from "@/lib/library/followed-series";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";
import { PageTransition } from "@/components/shared/page-transition";
import { SavedEpisodesProvider } from "@/components/library/saved-episodes-provider";
import { ProgressProvider } from "@/components/library/progress-provider";
import { NotesProvider } from "@/components/library/notes-provider";
import { FollowedSeriesProvider } from "@/components/library/followed-series-provider";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  // Real, server-verified session (see lib/auth/server.ts) -- same helper /admin
  // uses. Passed down as a prop so the header (a Client Component, for its
  // scroll/menu interactivity) never has to read auth state itself.
  // getSessionUser() is request-memoized (React cache()), so calling it again
  // inside getSavedEpisodeIds()/getWatchProgress()/getUserNotes()/
  // getFollowedSeriesIds() below costs no extra query -- five DB reads total
  // per page load (user, saves, progress, notes, follows), not one per
  // component/episode/series.
  const [sessionUser, savedEpisodeIds, watchProgress, notes, followedSeriesIds] = await Promise.all([
    getSessionUser(),
    getSavedEpisodeIds(),
    getWatchProgress(),
    getUserNotes(),
    getFollowedSeriesIds(),
  ]);
  const isAuthenticated = Boolean(sessionUser);

  return (
    <SavedEpisodesProvider initialSavedEpisodeIds={savedEpisodeIds} isAuthenticated={isAuthenticated}>
      <ProgressProvider initialProgress={watchProgress} isAuthenticated={isAuthenticated}>
        <NotesProvider initialNotes={notes} isAuthenticated={isAuthenticated}>
          <FollowedSeriesProvider initialFollowedSeriesIds={followedSeriesIds} isAuthenticated={isAuthenticated}>
            <SiteHeader sessionUser={sessionUser} />
            <PageTransition>{children}</PageTransition>
            <SiteFooter />
          </FollowedSeriesProvider>
        </NotesProvider>
      </ProgressProvider>
    </SavedEpisodesProvider>
  );
}
