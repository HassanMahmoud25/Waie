"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/server";
import { createEpisodeSchema, updateEpisodeContentSchema } from "@/lib/validation/admin-episode";
import {
  AdminContentError,
  createDraftContentFromYouTube,
  updateEpisodeContent,
  publishEpisode,
  unpublishEpisode,
  deleteEpisode,
} from "@/lib/admin/content/episodes";
import { revalidatePublicEpisodePaths } from "@/lib/admin/content/revalidate";

/**
 * The episode CMS's Server Actions -- create/update/publish/unpublish/delete --
 * the only way any admin UI mutates an episode.
 *
 * Every one of them: requires ADMIN (never trusts a client-supplied role or
 * userId -- requireAdmin() re-reads the role from the database off the
 * signed session, exactly like every other admin action in this project),
 * validates input, and revalidates the same small, predictable set of
 * public paths afterward (see revalidatePublicEpisodePaths, lib/admin/
 * content/revalidate.ts -- also reused by person-actions.ts, since a
 * Person's name/image edit can go stale on every episode page that person
 * is tagged on).
 */

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

type CreateEpisodeActionResult =
  | { ok: true; data: { kind: "episode"; id: string; slug: string } }
  | { ok: true; data: { kind: "short"; title: string } }
  | { ok: false; error: string };

/**
 * Creates a DRAFT episode -- or, when the pasted URL turns out to be a
 * YouTube Short, a DRAFT Short instead (see createDraftContentFromYouTube's
 * doc comment: quick-add must classify exactly like bulk sync, never assume
 * "episode"). There is no admin editor for Short yet, so the "short" result
 * carries just enough to show a confirmation -- CreateEpisodeForm stays on
 * the page instead of navigating to a non-existent editor route.
 */
export async function createEpisodeAction(youtubeUrlOrId: string): Promise<CreateEpisodeActionResult> {
  await requireAdmin();

  const parsed = createEpisodeSchema.safeParse({ youtubeUrlOrId });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "تحقق من الرابط." };
  }

  try {
    const result = await createDraftContentFromYouTube(parsed.data.youtubeUrlOrId);
    revalidatePath("/admin/episodes");
    revalidatePath("/admin"); // the overview's "recent episodes" tile
    if (result.kind === "short") {
      return { ok: true, data: { kind: "short", title: result.short.youtubeTitle } };
    }
    return { ok: true, data: { kind: "episode", id: result.episode.id, slug: result.episode.slug } };
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
    revalidatePath("/admin");
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
    revalidatePath("/admin");
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
    revalidatePath("/admin");
    revalidatePublicEpisodePaths(episode.slug, episode.series?.slug ?? null);
    return { ok: true, data: { id: episode.id, slug: episode.slug } };
  } catch (error) {
    if (error instanceof AdminContentError) return { ok: false, error: error.message };
    console.error("unpublishEpisodeAction failed:", error);
    return { ok: false, error: "حدث خطأ غير متوقع أثناء إلغاء النشر." };
  }
}

/**
 * Permanently deletes an episode -- requireAdmin() is the only thing that
 * gates this (see lib/auth/server.ts): the delete UI only exists inside the
 * admin editor, but this action is reachable directly, so it re-checks
 * authorization itself exactly like every action above instead of trusting
 * the caller ever went through that UI.
 */
export async function deleteEpisodeAction(id: string): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  if (typeof id !== "string" || id.trim() === "") return { ok: false, error: "حلقة غير صحيحة." };

  try {
    const { slug, seriesSlug } = await deleteEpisode(id);
    revalidatePath("/admin/episodes");
    revalidatePath("/admin");
    revalidatePublicEpisodePaths(slug, seriesSlug);
    return { ok: true, data: { id } };
  } catch (error) {
    if (error instanceof AdminContentError) return { ok: false, error: error.message };
    console.error("deleteEpisodeAction failed:", error);
    return { ok: false, error: "حدث خطأ غير متوقع أثناء الحذف." };
  }
}
