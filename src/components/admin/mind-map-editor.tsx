"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, CircleCheck, ChevronUp, ChevronDown, Loader2, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/content/empty-state";
import { formatTimestamp } from "@/lib/utils/format";
import { saveMindMapAction, deleteMindMapAction } from "@/lib/admin/content/mind-map-actions";
import type { MindMapNode } from "@/types/mind-map";

/**
 * The Phase 5G admin Mind Map / Chapters editor -- add/edit/delete/reorder
 * nodes for one episode, then Save writes the whole tree back to
 * MindMap.nodes in one Server Action call (mind-map-actions.ts). Exactly
 * like the Transcript editor: no per-node persistence, all tree operations
 * are local state, only Save ever talks to the server.
 *
 * The stored shape is a SINGLE root MindMapNode (see types/mind-map.ts) --
 * not an array of top-level nodes -- and the public MindMapTree renders that
 * root as a real, visible node. This editor mirrors that exactly: the root
 * is shown and editable like any other node (label/description/timestamp),
 * just without move/delete controls (it has no siblings, and deleting the
 * whole map is the separate "حذف الخريطة بالكامل" action below). Its
 * children are the tree's true top-level "chapters".
 *
 * A chapter has a START time only (Phase 5H) -- never an end time. A
 * chapter's effective duration is implicit: it runs until the next
 * chapter's start, and the last chapter runs to the end of the episode.
 * `timestampSeconds` stays optional: some nodes are conceptual section
 * headers rather than moments in the episode (e.g. the root, or a grouping
 * node with no single instant of its own).
 *
 * Never touches MindMapTree, EpisodeKnowledgeTabs, or any public rendering
 * code -- this writes to the same MindMap row the public page already reads.
 */

function createNode(): MindMapNode {
  return { id: crypto.randomUUID(), label: "", children: [] };
}

function updateNode(node: MindMapNode, id: string, patch: Partial<MindMapNode>): MindMapNode {
  if (node.id === id) return { ...node, ...patch };
  return { ...node, children: node.children.map((child) => updateNode(child, id, patch)) };
}

/** Removing a node also removes its whole subtree for free -- children are nested by value, not referenced elsewhere, so there is no separate cleanup step and no way to orphan a node. */
function removeNode(node: MindMapNode, id: string): MindMapNode {
  return { ...node, children: node.children.filter((child) => child.id !== id).map((child) => removeNode(child, id)) };
}

function addChildNode(node: MindMapNode, parentId: string, child: MindMapNode): MindMapNode {
  if (node.id === parentId) return { ...node, children: [...node.children, child] };
  return { ...node, children: node.children.map((c) => addChildNode(c, parentId, child)) };
}

/** Swaps a node with its previous/next sibling within whichever children array it lives in -- root-level nodes are just `root`'s children, so the same recursion handles them with no special case. */
function moveSibling(node: MindMapNode, id: string, direction: "up" | "down"): MindMapNode {
  const index = node.children.findIndex((child) => child.id === id);
  if (index !== -1) {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= node.children.length) return node;
    const children = [...node.children];
    [children[index], children[targetIndex]] = [children[targetIndex], children[index]];
    return { ...node, children };
  }
  return { ...node, children: node.children.map((child) => moveSibling(child, id, direction)) };
}

function depthEyebrow(depth: number): string {
  if (depth === 0) return "العقدة الرئيسية للخريطة";
  if (depth === 1) return "فصل";
  return "عنصر فرعي";
}

function NodeEditor({
  node,
  depth,
  isRoot,
  canMoveUp,
  canMoveDown,
  onUpdate,
  onAddChild,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  node: MindMapNode;
  depth: number;
  isRoot: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onUpdate: (id: string, patch: Partial<MindMapNode>) => void;
  onAddChild: (parentId: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDelete: (id: string, label: string, hasChildren: boolean) => void;
}) {
  return (
    <li className={depth > 0 ? "border-s-2 border-[var(--line-soft)] ps-5" : ""}>
      <div className="grid gap-4 rounded-2xl border border-[var(--line-soft)] bg-white/40 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="eyebrow">{depthEyebrow(depth)}</p>
          {!isRoot && (
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => onMoveUp(node.id)}
                disabled={!canMoveUp}
                aria-label="نقل العنصر للأعلى"
                title="نقل للأعلى"
                className="admin-icon-btn"
              >
                <ChevronUp size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onMoveDown(node.id)}
                disabled={!canMoveDown}
                aria-label="نقل العنصر للأسفل"
                title="نقل للأسفل"
                className="admin-icon-btn"
              >
                <ChevronDown size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(node.id, node.label, node.children.length > 0)}
                aria-label="حذف العنصر"
                title="حذف"
                className="admin-icon-btn admin-icon-btn--danger"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
          <div>
            <label htmlFor={`label-${node.id}`} className="admin-label">
              العنوان
            </label>
            <input
              id={`label-${node.id}`}
              value={node.label}
              onChange={(e) => onUpdate(node.id, { label: e.target.value })}
              className="admin-field"
            />
          </div>
          <div>
            <label htmlFor={`ts-${node.id}`} className="admin-label">
              بداية الفصل (ثانية، اختياري)
            </label>
            <input
              id={`ts-${node.id}`}
              type="number"
              min={0}
              dir="ltr"
              value={node.timestampSeconds ?? ""}
              onChange={(e) =>
                onUpdate(node.id, {
                  timestampSeconds: e.target.value.trim() === "" ? undefined : Number(e.target.value),
                })
              }
              className="admin-field"
            />
            <p className="meta mt-1.5">
              {typeof node.timestampSeconds === "number" ? (
                <>
                  يبدأ عند <span dir="ltr">{formatTimestamp(node.timestampSeconds)}</span>
                </>
              ) : (
                "بلا توقيت (عنصر توضيحي)"
              )}
            </p>
          </div>
        </div>

        <div>
          <label htmlFor={`desc-${node.id}`} className="admin-label">
            الوصف (اختياري)
          </label>
          <textarea
            id={`desc-${node.id}`}
            value={node.description ?? ""}
            onChange={(e) => onUpdate(node.id, { description: e.target.value.trim() === "" ? undefined : e.target.value })}
            rows={2}
            className="admin-field"
          />
        </div>

        <Button
          type="button"
          variant="secondary"
          className="w-fit"
          onClick={() => onAddChild(node.id)}
          icon={<Plus size={14} aria-hidden="true" />}
          iconPosition="start"
        >
          إضافة عنصر فرعي
        </Button>
      </div>

      {node.children.length > 0 && (
        <ul className="mt-4 grid gap-4">
          {node.children.map((child, index) => (
            <NodeEditor
              key={child.id}
              node={child}
              depth={depth + 1}
              isRoot={false}
              canMoveUp={index > 0}
              canMoveDown={index < node.children.length - 1}
              onUpdate={onUpdate}
              onAddChild={onAddChild}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function MindMapEditor({
  episodeId,
  initialTitle,
  initialRoot,
  hasExistingMindMap,
}: {
  episodeId: string;
  initialTitle: string;
  initialRoot: MindMapNode | null;
  hasExistingMindMap: boolean;
}) {
  const router = useRouter();

  const [title, setTitle] = useState(initialTitle);
  const [root, setRoot] = useState<MindMapNode | null>(initialRoot);
  const [exists, setExists] = useState(hasExistingMindMap);

  const [saveState, setSaveState] = useState<{ error?: string; success?: boolean }>({});
  const [isSaving, startSave] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDelete] = useTransition();

  function handleCreate() {
    setRoot(createNode());
    setSaveState({});
  }

  function update(id: string, patch: Partial<MindMapNode>) {
    setRoot((prev) => (prev ? updateNode(prev, id, patch) : prev));
  }

  function addChild(parentId: string) {
    setRoot((prev) => (prev ? addChildNode(prev, parentId, createNode()) : prev));
  }

  function moveUp(id: string) {
    setRoot((prev) => (prev ? moveSibling(prev, id, "up") : prev));
  }

  function moveDown(id: string) {
    setRoot((prev) => (prev ? moveSibling(prev, id, "down") : prev));
  }

  function remove(id: string, label: string, hasChildren: boolean) {
    if (hasChildren && !window.confirm(`حذف "${label || "هذا العنصر"}" وكل ما يتفرّع منه؟ لن يُطبَّق هذا إلا بعد الحفظ.`)) {
      return;
    }
    setRoot((prev) => (prev ? removeNode(prev, id) : prev));
  }

  function handleSave() {
    if (!root) return;
    setSaveState({});
    startSave(async () => {
      const result = await saveMindMapAction(episodeId, { title, root });
      if (!result.ok) {
        setSaveState({ error: result.error });
        return;
      }
      setSaveState({ success: true });
      setExists(true);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!window.confirm("حذف خريطة هذه الحلقة بالكامل نهائيًا؟ لن يؤثر هذا على الحلقة نفسها. لا يمكن التراجع عن هذا الإجراء.")) return;
    setDeleteError(null);
    startDelete(async () => {
      const result = await deleteMindMapAction(episodeId);
      if (!result.ok) {
        setDeleteError(result.error);
        return;
      }
      setRoot(null);
      setTitle("");
      setExists(false);
      setSaveState({});
      router.refresh();
    });
  }

  return (
    <section className="admin-panel grid gap-6 p-5 sm:p-8" aria-labelledby="mind-map-heading">
      <div>
        <h2 id="mind-map-heading" className="text-lg font-black tracking-[-.01em]">
          خريطة الحلقة
        </h2>
        <p className="mt-1 text-sm leading-7 text-[var(--ink-soft)]">
          تُعرض هذه الخريطة للزوار في تبويب &quot;خريطة الحلقة&quot; على صفحة الحلقة العامة، كشجرة فصول وعناصر فرعية قابلة للطي. لكل فصل وقت بداية فقط -- ينتهي تلقائيًا عند بداية الفصل التالي، وينتهي الفصل الأخير بنهاية الحلقة.
        </p>
      </div>

      {!root ? (
        <>
          <EmptyState title="لا توجد خريطة لهذه الحلقة بعد." description="أنشئ خريطة لتقسيم الحلقة إلى فصول وعناصر فرعية." />
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              className="w-fit"
              onClick={handleCreate}
              icon={<Plus size={16} aria-hidden="true" />}
              iconPosition="start"
            >
              إنشاء خريطة
            </Button>
            {/* Only reachable if a MindMap row exists but its stored tree couldn't be
                read back (see toMindMapRoot) -- lets an admin clear it instead of being stuck. */}
            {exists && (
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                disabled={isDeleting}
                aria-busy={isDeleting}
                icon={isDeleting ? <Loader2 className="animate-spin" size={16} aria-hidden="true" /> : <Trash2 size={16} aria-hidden="true" />}
                iconPosition="start"
              >
                حذف الخريطة التالفة
              </Button>
            )}
          </div>
          {deleteError && (
            <p role="alert" className="admin-notice admin-notice--danger font-bold">
              <CircleAlert size={17} aria-hidden="true" />
              {deleteError}
            </p>
          )}
        </>
      ) : (
        <>
          <div>
            <label htmlFor="mind-map-title" className="admin-label">
              عنوان الخريطة
            </label>
            <input id="mind-map-title" value={title} onChange={(e) => setTitle(e.target.value)} className="admin-field" />
          </div>

          <ul className="grid gap-4">
            <NodeEditor
              node={root}
              depth={0}
              isRoot
              canMoveUp={false}
              canMoveDown={false}
              onUpdate={update}
              onAddChild={addChild}
              onMoveUp={moveUp}
              onMoveDown={moveDown}
              onDelete={remove}
            />
          </ul>

          {saveState.error && (
            <p role="alert" className="admin-notice admin-notice--danger font-bold">
              <CircleAlert size={17} aria-hidden="true" />
              {saveState.error}
            </p>
          )}
          {saveState.success && (
            <p role="status" className="admin-notice admin-notice--success font-bold">
              <CircleCheck size={17} aria-hidden="true" />
              تم حفظ الخريطة.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 border-t border-[var(--line-soft)] pt-6">
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              aria-busy={isSaving}
              icon={isSaving ? <Loader2 className="animate-spin" size={16} aria-hidden="true" /> : undefined}
              iconPosition="start"
            >
              {isSaving ? "جارٍ الحفظ…" : "حفظ الخريطة"}
            </Button>

            {exists && (
              <>
                {deleteError && (
                  <p role="alert" className="admin-notice admin-notice--danger font-bold">
                    <CircleAlert size={17} aria-hidden="true" />
                    {deleteError}
                  </p>
                )}
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  aria-busy={isDeleting}
                  icon={isDeleting ? <Loader2 className="animate-spin" size={16} aria-hidden="true" /> : <Trash2 size={16} aria-hidden="true" />}
                  iconPosition="start"
                >
                  حذف الخريطة بالكامل
                </Button>
              </>
            )}
          </div>
        </>
      )}
    </section>
  );
}
