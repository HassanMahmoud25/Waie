"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/server";
import { createCollectionSchema, updateCollectionSchema, idField } from "@/lib/validation/admin-collection";
import {
  AdminContentError,
  createCollection,
  updateCollectionContent,
  publishCollection,
  unpublishCollection,
  deleteCollection,
  addCollectionEpisode,
  removeCollectionEpisode,
  moveCollectionEpisode,
} from "@/lib/admin/content/collections";

/**
 * Collection CMS (Phase 3D) Server Actions -- create/update/publish/
 * unpublish/delete plus episode-assignment (add/remove/move), the only way
 * any admin UI mutates a collection. Mirrors series-actions.ts's shape
 * exactly: every action requires ADMIN (never trusts a client-supplied
 * role/id), validates input, and revalidates a small, predictable set of
 * paths.
 */

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

function revalidateCollectionPaths(slug: string): void {
  revalidatePath("/collections");
  revalidatePath(`/collections/${slug}`);
  revalidatePath("/");
}

export async function createCollectionAction(title: string): Promise<ActionResult<{ id: string; slug: string }>> {
  await requireAdmin();

  const parsed = createCollectionSchema.safeParse({ title });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "تحقق من العنوان." };
  }

  try {
    const collection = await createCollection(parsed.data.title);
    revalidatePath("/admin/collections");
    return { ok: true, data: { id: collection.id, slug: collection.slug } };
  } catch (error) {
    if (error instanceof AdminContentError) return { ok: false, error: error.message };
    console.error("createCollectionAction failed:", error);
    return { ok: false, error: "حدث خطأ غير متوقع أثناء إنشاء المجموعة." };
  }
}

export async function updateCollectionAction(
  id: string,
  patch: unknown,
): Promise<ActionResult<{ id: string; slug: string }>> {
  await requireAdmin();

  if (typeof id !== "string" || id.trim() === "") {
    return { ok: false, error: "مجموعة غير صحيحة." };
  }

  const parsed = updateCollectionSchema.safeParse(patch);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "تحقق من الحقول." };
  }

  try {
    const collection = await updateCollectionContent(id, parsed.data);
    revalidatePath("/admin/collections");
    revalidatePath(`/admin/collections/${id}`);
    revalidateCollectionPaths(collection.slug);
    return { ok: true, data: { id: collection.id, slug: collection.slug } };
  } catch (error) {
    if (error instanceof AdminContentError) return { ok: false, error: error.message };
    console.error("updateCollectionAction failed:", error);
    return { ok: false, error: "حدث خطأ غير متوقع أثناء التعديل." };
  }
}

export async function publishCollectionAction(id: string): Promise<ActionResult<{ id: string; slug: string }>> {
  await requireAdmin();
  if (typeof id !== "string" || id.trim() === "") return { ok: false, error: "مجموعة غير صحيحة." };

  try {
    const collection = await publishCollection(id);
    revalidatePath("/admin/collections");
    revalidatePath(`/admin/collections/${id}`);
    revalidateCollectionPaths(collection.slug);
    return { ok: true, data: { id: collection.id, slug: collection.slug } };
  } catch (error) {
    if (error instanceof AdminContentError) return { ok: false, error: error.message };
    console.error("publishCollectionAction failed:", error);
    return { ok: false, error: "حدث خطأ غير متوقع أثناء النشر." };
  }
}

export async function unpublishCollectionAction(id: string): Promise<ActionResult<{ id: string; slug: string }>> {
  await requireAdmin();
  if (typeof id !== "string" || id.trim() === "") return { ok: false, error: "مجموعة غير صحيحة." };

  try {
    const collection = await unpublishCollection(id);
    revalidatePath("/admin/collections");
    revalidatePath(`/admin/collections/${id}`);
    revalidateCollectionPaths(collection.slug);
    return { ok: true, data: { id: collection.id, slug: collection.slug } };
  } catch (error) {
    if (error instanceof AdminContentError) return { ok: false, error: error.message };
    console.error("unpublishCollectionAction failed:", error);
    return { ok: false, error: "حدث خطأ غير متوقع أثناء إلغاء النشر." };
  }
}

export async function deleteCollectionAction(id: string): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  if (typeof id !== "string" || id.trim() === "") return { ok: false, error: "مجموعة غير صحيحة." };

  try {
    await deleteCollection(id);
    revalidatePath("/admin/collections");
    revalidatePath("/collections");
    revalidatePath("/");
    return { ok: true, data: { id } };
  } catch (error) {
    if (error instanceof AdminContentError) return { ok: false, error: error.message };
    console.error("deleteCollectionAction failed:", error);
    return { ok: false, error: "حدث خطأ غير متوقع أثناء الحذف." };
  }
}

export async function addCollectionEpisodeAction(
  collectionId: string,
  episodeId: string,
): Promise<ActionResult<null>> {
  await requireAdmin();

  const parsedCollectionId = idField.safeParse(collectionId);
  const parsedEpisodeId = idField.safeParse(episodeId);
  if (!parsedCollectionId.success || !parsedEpisodeId.success) return { ok: false, error: "معرّف غير صحيح." };

  try {
    const slug = await addCollectionEpisode(parsedCollectionId.data, parsedEpisodeId.data);
    revalidatePath(`/admin/collections/${collectionId}`);
    revalidateCollectionPaths(slug);
    return { ok: true, data: null };
  } catch (error) {
    if (error instanceof AdminContentError) return { ok: false, error: error.message };
    console.error("addCollectionEpisodeAction failed:", error);
    return { ok: false, error: "حدث خطأ غير متوقع أثناء الإضافة." };
  }
}

export async function removeCollectionEpisodeAction(
  collectionId: string,
  episodeId: string,
): Promise<ActionResult<null>> {
  await requireAdmin();

  const parsedCollectionId = idField.safeParse(collectionId);
  const parsedEpisodeId = idField.safeParse(episodeId);
  if (!parsedCollectionId.success || !parsedEpisodeId.success) return { ok: false, error: "معرّف غير صحيح." };

  try {
    const slug = await removeCollectionEpisode(parsedCollectionId.data, parsedEpisodeId.data);
    revalidatePath(`/admin/collections/${collectionId}`);
    revalidateCollectionPaths(slug);
    return { ok: true, data: null };
  } catch (error) {
    if (error instanceof AdminContentError) return { ok: false, error: error.message };
    console.error("removeCollectionEpisodeAction failed:", error);
    return { ok: false, error: "حدث خطأ غير متوقع أثناء الإزالة." };
  }
}

export async function moveCollectionEpisodeAction(
  collectionId: string,
  episodeId: string,
  direction: "up" | "down",
): Promise<ActionResult<null>> {
  await requireAdmin();

  const parsedCollectionId = idField.safeParse(collectionId);
  const parsedEpisodeId = idField.safeParse(episodeId);
  if (!parsedCollectionId.success || !parsedEpisodeId.success) return { ok: false, error: "معرّف غير صحيح." };
  if (direction !== "up" && direction !== "down") return { ok: false, error: "اتجاه غير صحيح." };

  try {
    const slug = await moveCollectionEpisode(parsedCollectionId.data, parsedEpisodeId.data, direction);
    revalidatePath(`/admin/collections/${collectionId}`);
    revalidateCollectionPaths(slug);
    return { ok: true, data: null };
  } catch (error) {
    if (error instanceof AdminContentError) return { ok: false, error: error.message };
    console.error("moveCollectionEpisodeAction failed:", error);
    return { ok: false, error: "حدث خطأ غير متوقع أثناء إعادة الترتيب." };
  }
}
