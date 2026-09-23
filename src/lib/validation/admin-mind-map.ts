import { z } from "zod";
import type { MindMapNode } from "@/types/mind-map";

/**
 * Validation for the admin Mind Map / Chapters editor (Phase 5G) -- one
 * Server Action (saveMindMapAction, see lib/admin/content/mind-map-actions.ts)
 * saves the whole tree at once, mirroring the Transcript editor's "one Json
 * blob, one save" shape rather than per-node persistence.
 *
 * Mirrors the existing MindMapNode type (src/types/mind-map.ts) exactly:
 * id, label (required), description? , timestampSeconds? (>= 0), children
 * (always an array, recursive). `timestampSeconds` has no `.nullable()` --
 * the type only ever allows "present as a number" or "absent", never
 * `null`, so an admin clearing the field must send `undefined`, not `null`
 * or `0` (see mind-map-editor.tsx's own timestamp input handling).
 */

const mindMapNodeSchema: z.ZodType<MindMapNode> = z.lazy(() =>
  z.object({
    id: z.string().trim().min(1, "معرّف العنصر مفقود."),
    label: z.string().trim().min(1, "عنوان العنصر لا يمكن أن يكون فارغًا."),
    description: z.string().trim().min(1, "الوصف لا يمكن أن يكون فارغًا.").optional(),
    timestampSeconds: z
      .number()
      .finite("قيمة التوقيت غير صالحة.")
      .min(0, "التوقيت يجب ألا يكون سالبًا.")
      .optional(),
    children: z.array(mindMapNodeSchema),
  }),
);

/** Walks the whole tree (root + every descendant) once, for the global-uniqueness check below. */
function collectIds(node: MindMapNode, ids: string[]): void {
  ids.push(node.id);
  for (const child of node.children) collectIds(child, ids);
}

export const saveMindMapSchema = z
  .object({
    title: z.string().trim().min(1, "أدخل عنوان الخريطة."),
    root: mindMapNodeSchema,
  })
  .superRefine(({ root }, ctx) => {
    const ids: string[] = [];
    collectIds(root, ids);

    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "لا يمكن أن يحمل عنصران نفس المعرّف داخل الخريطة.",
          path: ["root"],
        });
        return;
      }
      seen.add(id);
    }
  });

export type SaveMindMapInput = z.infer<typeof saveMindMapSchema>;
