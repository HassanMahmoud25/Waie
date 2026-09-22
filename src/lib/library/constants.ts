/**
 * Watching past this fraction of an episode counts as finished, same as most
 * streaming apps -- the viewer shouldn't have to scrub to the exact last
 * second for it to "count". Shared between the anonymous/localStorage path
 * (hooks/use-library.ts) and the authenticated/database path
 * (lib/library/actions.ts, lib/library/progress-store.ts) so the two behave
 * identically. Kept in its own file with zero other imports so it's safely
 * importable from client code, server actions, and plain modules alike.
 */
export const COMPLETE_THRESHOLD = 0.95;
