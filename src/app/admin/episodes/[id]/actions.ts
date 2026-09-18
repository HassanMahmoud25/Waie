"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { contentRepository } from "@/lib/repositories";
import { episodeEditSchema } from "@/lib/validation/episode";

export type EpisodeEditState = { error?: string };

/**
 * In-memory demo mutation: updates the module-level episode array for the
 * running server process. Real persistence arrives with Prisma; the
 * repository seam (`contentRepository.updateEpisode`) is already the only
 * thing this action talks to, so swapping the implementation later needs no
 * change here.
 */
export async function updateEpisodeAction(
  id: string,
  _prevState: EpisodeEditState,
  formData: FormData,
): Promise<EpisodeEditState> {
  const parsed = episodeEditSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "تحقق من الحقول." };
  }

  const updated = await contentRepository.updateEpisode(id, parsed.data);
  if (!updated) {
    return { error: "تعذّر العثور على هذه الحلقة." };
  }

  revalidatePath("/admin/episodes");
  revalidatePath(`/admin/episodes/${id}`);
  redirect("/admin/episodes");
}
