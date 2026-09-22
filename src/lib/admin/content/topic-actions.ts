"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/server";
import { createTopicSchema, updateTopicSchema } from "@/lib/validation/admin-topic";
import { AdminContentError, createTopic, updateTopicContent, deleteTopic } from "@/lib/admin/content/topics";

/**
 * Topic CMS (Phase 3C) Server Actions -- create/update/delete, the only way
 * any admin UI mutates a topic. No publish/unpublish: topics have no status
 * field (see prisma/schema.prisma). Mirrors series-actions.ts's shape.
 */

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

function revalidateTopicPaths(slug: string): void {
  revalidatePath("/topics");
  revalidatePath(`/topics/${slug}`);
}

export async function createTopicAction(title: string): Promise<ActionResult<{ id: string; slug: string }>> {
  await requireAdmin();

  const parsed = createTopicSchema.safeParse({ title });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "تحقق من العنوان." };
  }

  try {
    const topic = await createTopic(parsed.data.title);
    revalidatePath("/admin/topics");
    return { ok: true, data: { id: topic.id, slug: topic.slug } };
  } catch (error) {
    if (error instanceof AdminContentError) return { ok: false, error: error.message };
    console.error("createTopicAction failed:", error);
    return { ok: false, error: "حدث خطأ غير متوقع أثناء إنشاء الموضوع." };
  }
}

export async function updateTopicAction(
  id: string,
  patch: unknown,
): Promise<ActionResult<{ id: string; slug: string }>> {
  await requireAdmin();

  if (typeof id !== "string" || id.trim() === "") {
    return { ok: false, error: "موضوع غير صحيح." };
  }

  const parsed = updateTopicSchema.safeParse(patch);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "تحقق من الحقول." };
  }

  try {
    const topic = await updateTopicContent(id, parsed.data);
    revalidatePath("/admin/topics");
    revalidatePath(`/admin/topics/${id}`);
    revalidateTopicPaths(topic.slug);
    return { ok: true, data: { id: topic.id, slug: topic.slug } };
  } catch (error) {
    if (error instanceof AdminContentError) return { ok: false, error: error.message };
    console.error("updateTopicAction failed:", error);
    return { ok: false, error: "حدث خطأ غير متوقع أثناء التعديل." };
  }
}

export async function deleteTopicAction(id: string): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  if (typeof id !== "string" || id.trim() === "") return { ok: false, error: "موضوع غير صحيح." };

  try {
    await deleteTopic(id);
    revalidatePath("/admin/topics");
    revalidatePath("/topics");
    return { ok: true, data: { id } };
  } catch (error) {
    if (error instanceof AdminContentError) return { ok: false, error: error.message };
    console.error("deleteTopicAction failed:", error);
    return { ok: false, error: "حدث خطأ غير متوقع أثناء الحذف." };
  }
}
