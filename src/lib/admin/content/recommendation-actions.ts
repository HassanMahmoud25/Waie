"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/server";
import { saveRecommendationsSchema } from "@/lib/validation/admin-recommendation";
import { AdminContentError, saveRecommendations } from "@/lib/admin/content/recommendations";

/**
 * The Recommendations editor's only Server Action (Phase 5I) -- there is no
 * separate "delete" action: removing a recommendation is a local-state edit
 * like any other, and Save reconciles the whole list against the DB in one
 * call (see lib/admin/content/recommendations.ts). Requires ADMIN, validates
 * the complete list, and revalidates the admin episode page plus the public
 * episode page (the only place recommendations are ever rendered, via the
 * unchanged RecommendationsPanel).
 */

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function saveRecommendationsAction(episodeId: string, items: unknown): Promise<ActionResult<null>> {
  await requireAdmin();

  if (typeof episodeId !== "string" || episodeId.trim() === "") {
    return { ok: false, error: "حلقة غير صحيحة." };
  }

  const parsed = saveRecommendationsSchema.safeParse(items);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "تحقق من التوصيات." };
  }

  try {
    const { episodeSlug } = await saveRecommendations(episodeId, parsed.data);
    revalidatePath(`/admin/episodes/${episodeId}`);
    revalidatePath(`/episodes/${episodeSlug}`);
    return { ok: true, data: null };
  } catch (error) {
    if (error instanceof AdminContentError) return { ok: false, error: error.message };
    console.error("saveRecommendationsAction failed:", error);
    return { ok: false, error: "حدث خطأ غير متوقع أثناء حفظ التوصيات." };
  }
}
