"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/server";
import { createSeriesSchema, updateSeriesContentSchema } from "@/lib/validation/admin-series";
import {
  AdminContentError,
  createSeries,
  updateSeriesContent,
  publishSeries,
  unpublishSeries,
  deleteSeries,
} from "@/lib/admin/content/series";

/**
 * Series CMS (Phase 3C) Server Actions -- create/update/publish/unpublish/
 * delete, the only way any admin UI mutates a series. Mirrors
 * lib/admin/content/actions.ts's shape exactly: every action requires ADMIN
 * (never trusts a client-supplied role/id), validates input, and
 * revalidates a small, predictable set of paths.
 */

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

function revalidateSeriesPaths(slug: string): void {
  revalidatePath("/series");
  revalidatePath(`/series/${slug}`);
  revalidatePath("/");
}

export async function createSeriesAction(title: string): Promise<ActionResult<{ id: string; slug: string }>> {
  await requireAdmin();

  const parsed = createSeriesSchema.safeParse({ title });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "تحقق من العنوان." };
  }

  try {
    const series = await createSeries(parsed.data.title);
    revalidatePath("/admin/series");
    return { ok: true, data: { id: series.id, slug: series.slug } };
  } catch (error) {
    if (error instanceof AdminContentError) return { ok: false, error: error.message };
    console.error("createSeriesAction failed:", error);
    return { ok: false, error: "حدث خطأ غير متوقع أثناء إنشاء السلسلة." };
  }
}

export async function updateSeriesContentAction(
  id: string,
  patch: unknown,
): Promise<ActionResult<{ id: string; slug: string }>> {
  await requireAdmin();

  if (typeof id !== "string" || id.trim() === "") {
    return { ok: false, error: "سلسلة غير صحيحة." };
  }

  const parsed = updateSeriesContentSchema.safeParse(patch);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "تحقق من الحقول." };
  }

  try {
    const series = await updateSeriesContent(id, parsed.data);
    revalidatePath("/admin/series");
    revalidatePath(`/admin/series/${id}`);
    revalidateSeriesPaths(series.slug);
    return { ok: true, data: { id: series.id, slug: series.slug } };
  } catch (error) {
    if (error instanceof AdminContentError) return { ok: false, error: error.message };
    console.error("updateSeriesContentAction failed:", error);
    return { ok: false, error: "حدث خطأ غير متوقع أثناء التعديل." };
  }
}

export async function publishSeriesAction(id: string): Promise<ActionResult<{ id: string; slug: string }>> {
  await requireAdmin();
  if (typeof id !== "string" || id.trim() === "") return { ok: false, error: "سلسلة غير صحيحة." };

  try {
    const series = await publishSeries(id);
    revalidatePath("/admin/series");
    revalidatePath(`/admin/series/${id}`);
    revalidateSeriesPaths(series.slug);
    return { ok: true, data: { id: series.id, slug: series.slug } };
  } catch (error) {
    if (error instanceof AdminContentError) return { ok: false, error: error.message };
    console.error("publishSeriesAction failed:", error);
    return { ok: false, error: "حدث خطأ غير متوقع أثناء النشر." };
  }
}

export async function unpublishSeriesAction(id: string): Promise<ActionResult<{ id: string; slug: string }>> {
  await requireAdmin();
  if (typeof id !== "string" || id.trim() === "") return { ok: false, error: "سلسلة غير صحيحة." };

  try {
    const series = await unpublishSeries(id);
    revalidatePath("/admin/series");
    revalidatePath(`/admin/series/${id}`);
    revalidateSeriesPaths(series.slug);
    return { ok: true, data: { id: series.id, slug: series.slug } };
  } catch (error) {
    if (error instanceof AdminContentError) return { ok: false, error: error.message };
    console.error("unpublishSeriesAction failed:", error);
    return { ok: false, error: "حدث خطأ غير متوقع أثناء إلغاء النشر." };
  }
}

export async function deleteSeriesAction(id: string): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  if (typeof id !== "string" || id.trim() === "") return { ok: false, error: "سلسلة غير صحيحة." };

  try {
    await deleteSeries(id);
    revalidatePath("/admin/series");
    revalidatePath("/series");
    revalidatePath("/");
    return { ok: true, data: { id } };
  } catch (error) {
    if (error instanceof AdminContentError) return { ok: false, error: error.message };
    console.error("deleteSeriesAction failed:", error);
    return { ok: false, error: "حدث خطأ غير متوقع أثناء الحذف." };
  }
}
