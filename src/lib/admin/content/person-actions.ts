"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/server";
import { createPersonSchema, updatePersonSchema } from "@/lib/validation/admin-person";
import { AdminContentError, createPerson, updatePerson, deletePerson } from "@/lib/admin/content/people";
import { revalidatePublicEpisodePaths } from "@/lib/admin/content/revalidate";

/**
 * The People CMS's Server Actions -- create/update/delete, the only way any
 * admin UI mutates a Person. Mirrors topic-actions.ts's shape, with one
 * addition: update/delete also revalidate every public episode page that
 * shows this person (see people.ts's getAffectedEpisodePaths), since a
 * Person's name/image is read live off this one row wherever they're tagged
 * -- an episode page can otherwise keep serving a stale name/photo from the
 * Next.js cache indefinitely, not just until /admin/people/[id] is visited.
 */

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

function revalidateAffectedEpisodes(affectedEpisodes: { slug: string; seriesSlug: string | null }[]): void {
  for (const { slug, seriesSlug } of affectedEpisodes) {
    revalidatePublicEpisodePaths(slug, seriesSlug);
  }
}

export async function createPersonAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();

  const parsed = createPersonSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "تحقق من الحقول." };
  }

  try {
    const person = await createPerson(parsed.data);
    revalidatePath("/admin/people");
    return { ok: true, data: { id: person.id } };
  } catch (error) {
    if (error instanceof AdminContentError) return { ok: false, error: error.message };
    console.error("createPersonAction failed:", error);
    return { ok: false, error: "حدث خطأ غير متوقع أثناء إنشاء الشخص." };
  }
}

export async function updatePersonAction(id: string, patch: unknown): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();

  if (typeof id !== "string" || id.trim() === "") {
    return { ok: false, error: "سجل غير صحيح." };
  }

  const parsed = updatePersonSchema.safeParse(patch);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "تحقق من الحقول." };
  }

  try {
    const { person, affectedEpisodes } = await updatePerson(id, parsed.data);
    revalidatePath("/admin/people");
    revalidatePath(`/admin/people/${id}`);
    revalidateAffectedEpisodes(affectedEpisodes);
    return { ok: true, data: { id: person.id } };
  } catch (error) {
    if (error instanceof AdminContentError) return { ok: false, error: error.message };
    console.error("updatePersonAction failed:", error);
    return { ok: false, error: "حدث خطأ غير متوقع أثناء التعديل." };
  }
}

export async function deletePersonAction(id: string): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  if (typeof id !== "string" || id.trim() === "") return { ok: false, error: "سجل غير صحيح." };

  try {
    const { affectedEpisodes } = await deletePerson(id);
    revalidatePath("/admin/people");
    revalidateAffectedEpisodes(affectedEpisodes);
    return { ok: true, data: { id } };
  } catch (error) {
    if (error instanceof AdminContentError) return { ok: false, error: error.message };
    console.error("deletePersonAction failed:", error);
    return { ok: false, error: "حدث خطأ غير متوقع أثناء الحذف." };
  }
}
