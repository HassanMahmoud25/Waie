import { revalidatePath } from "next/cache";

/**
 * Centralized, predictable cache invalidation for a public episode page --
 * the one place every mutation that can affect what an episode page shows
 * calls, so the set of revalidated paths can't drift between episode
 * create/update/publish/unpublish (lib/admin/content/actions.ts) and a
 * Person's own name/image edit (lib/admin/content/person-actions.ts), which
 * affects every episode that person is tagged on. Deliberately a plain
 * module, not "use server" -- a Server Actions file may only export async
 * functions, and this one is a plain synchronous helper both actions files
 * import.
 */
export function revalidatePublicEpisodePaths(slug: string, seriesSlug: string | null): void {
  revalidatePath(`/episodes/${slug}`);
  revalidatePath("/");
  if (seriesSlug) revalidatePath(`/series/${seriesSlug}`);
}
