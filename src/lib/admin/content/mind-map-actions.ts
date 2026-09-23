"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/server";
import { saveMindMapSchema } from "@/lib/validation/admin-mind-map";
import { AdminContentError, saveMindMap, deleteMindMap } from "@/lib/admin/content/mind-maps";

/**
 * The Mind Map editor's Server Actions (Phase 5G) -- save (create-or-update)
 * and delete, the only way any admin UI mutates a MindMap. Mirrors
 * transcript-actions.ts's shape: every action requires ADMIN, validates the
 * complete tree, and revalidates the admin episode page plus the public
 * episode page (the only place a mind map is ever rendered, via the
 * unchanged MindMapTree/EpisodeKnowledgeTabs).
 */

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

function revalidateMindMapPaths(episodeId: string, episodeSlug: string): void {
  revalidatePath(`/admin/episodes/${episodeId}`);
  revalidatePath(`/episodes/${episodeSlug}`);
}

export async function saveMindMapAction(episodeId: string, payload: unknown): Promise<ActionResult<null>> {
  await requireAdmin();

  if (typeof episodeId !== "string" || episodeId.trim() === "") {
    return { ok: false, error: "حلقة غير صحيحة." };
  }

  const parsed = saveMindMapSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "تحقق من خريطة الحلقة." };
  }

  try {
    const { episodeSlug } = await saveMindMap(episodeId, parsed.data.title, parsed.data.root);
    revalidateMindMapPaths(episodeId, episodeSlug);
    return { ok: true, data: null };
  } catch (error) {
    if (error instanceof AdminContentError) return { ok: false, error: error.message };
    console.error("saveMindMapAction failed:", error);
    return { ok: false, error: "حدث خطأ غير متوقع أثناء حفظ الخريطة." };
  }
}

export async function deleteMindMapAction(episodeId: string): Promise<ActionResult<null>> {
  await requireAdmin();
  if (typeof episodeId !== "string" || episodeId.trim() === "") return { ok: false, error: "حلقة غير صحيحة." };

  try {
    const { episodeSlug } = await deleteMindMap(episodeId);
    revalidateMindMapPaths(episodeId, episodeSlug);
    return { ok: true, data: null };
  } catch (error) {
    if (error instanceof AdminContentError) return { ok: false, error: error.message };
    console.error("deleteMindMapAction failed:", error);
    return { ok: false, error: "حدث خطأ غير متوقع أثناء الحذف." };
  }
}
