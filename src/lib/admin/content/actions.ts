"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/server";
import { createEpisodeSchema, updateEpisodeContentSchema } from "@/lib/validation/admin-episode";
import {
  AdminContentError,
  createDraftEpisodeFromYouTube,
  updateEpisodeContent,
  publishEpisode,
  unpublishEpisode,
} from "@/lib/admin/content/episodes";

/**
 * The episode CMS's Server Actions -- create/update/publish/unpublish -- the
 * only way any admin UI mutates an episode. The old narrow title/description/
 * status/audioUrl edit form (src/app/admin/episodes/[id]/actions.ts) was
 * retired in Phase 3B once the richer editor below replaced its only caller.
 *
 * Every one of them: requires ADMIN (never trusts a client-supplied role or
 * userId -- requireAdmin() re-reads the role from the database off the
 * signed session, exactly like every other admin action in this project),
 * validates input, and revalidates the same small, predictable set of
 * public paths afterward (see revalidatePublicEpisodePaths below).
 */

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

/**
 * Centralized, predictable cache invalidation -- the one place every episode
 * mutation calls, so the set of revalidated paths can't drift between
 * create/update/publish/unpublish. The whole app already renders on request
 * (`export const dynamic = "force-dynamic"` in the root layout), so this is
 * a defensive/router-cache measure, not what makes new data show up.
 */
function revalidatePublicEpisodePaths(slug: string, seriesSlug: string | null): void {
  revalidatePath(`/episodes/${slug}`);
  revalidatePath("/");
  if (seriesSlug) revalidatePath(`/series/${seriesSlug}`);
}

export async function createEpisodeAction(youtubeUrlOrId: string): Promise<ActionResult<{ id: string; slug: string }>> {
  await requireAdmin();

  const parsed = createEpisodeSchema.safeParse({ youtubeUrlOrId });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "تحقق من الرابط." };
  }

  try {
    const episode = await createDraftEpisodeFromYouTube(parsed.data.youtubeUrlOrId);
    revalidatePath("/admin/episodes");
    return { ok: true, data: { id: episode.id, slug: episode.slug } };
  } catch (error) {
    if (error instanceof AdminContentError) return { ok: false, error: error.message };
    console.error("createEpisodeAction failed:", error);
    return { ok: false, error: "حدث خطأ غير متوقع أثناء إنشاء الحلقة." };
  }
}

export async function updateEpisodeContentAction(
  id: string,
  patch: unknown,
): Promise<ActionResult<{ id: string; slug: string }>> {
  await requireAdmin();

  if (typeof id !== "string" || id.trim() === "") {
    return { ok: false, error: "حلقة غير صحيحة." };
  }

  const parsed = updateEpisodeContentSchema.safeParse(patch);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "تحقق من الحقول." };
  }

  try {
    const episode = await updateEpisodeContent(id, parsed.data);
    revalidatePath("/admin/episodes");
    revalidatePath(`/admin/episodes/${id}`);
    revalidatePublicEpisodePaths(episode.slug, episode.series?.slug ?? null);
    return { ok: true, data: { id: episode.id, slug: episode.slug } };
  } catch (error) {
    if (error instanceof AdminContentError) return { ok: false, error: error.message };
    console.error("updateEpisodeContentAction failed:", error);
    return { ok: false, error: "حدث خطأ غير متوقع أثناء التعديل." };
  }
}

export async function publishEpisodeAction(id: string): Promise<ActionResult<{ id: string; slug: string }>> {
  await requireAdmin();
  if (typeof id !== "string" || id.trim() === "") return { ok: false, error: "حلقة غير صحيحة." };

  try {
    const episode = await publishEpisode(id);
    revalidatePath("/admin/episodes");
    revalidatePath(`/admin/episodes/${id}`);
    revalidatePublicEpisodePaths(episode.slug, episode.series?.slug ?? null);
    return { ok: true, data: { id: episode.id, slug: episode.slug } };
  } catch (error) {
    if (error instanceof AdminContentError) return { ok: false, error: error.message };
    console.error("publishEpisodeAction failed:", error);
    return { ok: false, error: "حدث خطأ غير متوقع أثناء النشر." };
  }
}

export async function unpublishEpisodeAction(id: string): Promise<ActionResult<{ id: string; slug: string }>> {
  await requireAdmin();
  if (typeof id !== "string" || id.trim() === "") return { ok: false, error: "حلقة غير صحيحة." };

  try {
    const episode = await unpublishEpisode(id);
    revalidatePath("/admin/episodes");
    revalidatePath(`/admin/episodes/${id}`);
    revalidatePublicEpisodePaths(episode.slug, episode.series?.slug ?? null);
    return { ok: true, data: { id: episode.id, slug: episode.slug } };
  } catch (error) {
    if (error instanceof AdminContentError) return { ok: false, error: error.message };
    console.error("unpublishEpisodeAction failed:", error);
    return { ok: false, error: "حدث خطأ غير متوقع أثناء إلغاء النشر." };
  }
}
