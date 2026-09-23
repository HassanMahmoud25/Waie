"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/server";
import { saveTranscriptSchema } from "@/lib/validation/admin-transcript";
import { AdminContentError, saveTranscript, deleteTranscript } from "@/lib/admin/content/transcripts";

/**
 * The Transcript editor's Server Actions (Phase 5E, simplified in Phase 5H)
 * -- save (create-or-update) and delete, the only way any admin UI mutates a
 * Transcript. Every action requires ADMIN, validates input, and revalidates
 * the admin episode page plus the public episode page (the only place a
 * transcript is ever rendered, via the unchanged TranscriptReader).
 */

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

function revalidateTranscriptPaths(episodeId: string, episodeSlug: string): void {
  revalidatePath(`/admin/episodes/${episodeId}`);
  revalidatePath(`/episodes/${episodeSlug}`);
}

export async function saveTranscriptAction(episodeId: string, text: unknown): Promise<ActionResult<null>> {
  await requireAdmin();

  if (typeof episodeId !== "string" || episodeId.trim() === "") {
    return { ok: false, error: "حلقة غير صحيحة." };
  }

  const parsed = saveTranscriptSchema.safeParse({ text });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "تحقق من نص الحلقة." };
  }

  try {
    const { episodeSlug } = await saveTranscript(episodeId, parsed.data.text);
    revalidateTranscriptPaths(episodeId, episodeSlug);
    return { ok: true, data: null };
  } catch (error) {
    if (error instanceof AdminContentError) return { ok: false, error: error.message };
    console.error("saveTranscriptAction failed:", error);
    return { ok: false, error: "حدث خطأ غير متوقع أثناء حفظ النص." };
  }
}

export async function deleteTranscriptAction(episodeId: string): Promise<ActionResult<null>> {
  await requireAdmin();
  if (typeof episodeId !== "string" || episodeId.trim() === "") return { ok: false, error: "حلقة غير صحيحة." };

  try {
    const { episodeSlug } = await deleteTranscript(episodeId);
    revalidateTranscriptPaths(episodeId, episodeSlug);
    return { ok: true, data: null };
  } catch (error) {
    if (error instanceof AdminContentError) return { ok: false, error: error.message };
    console.error("deleteTranscriptAction failed:", error);
    return { ok: false, error: "حدث خطأ غير متوقع أثناء الحذف." };
  }
}
