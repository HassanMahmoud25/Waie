"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, CircleCheck, ChevronUp, ChevronDown, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/content/empty-state";
import { formatTimestamp } from "@/lib/utils/format";
import { typeMeta } from "@/components/episode/recommendations-panel";
import { saveRecommendationsAction } from "@/lib/admin/content/recommendation-actions";
import { CREATABLE_RECOMMENDATION_TYPES } from "@/lib/validation/admin-recommendation";
import type { RecommendationDraft } from "@/lib/admin/content/recommendations";
import { RecommendationType } from "@prisma/client";

/**
 * The admin Recommendations editor (Phase 5I) -- add/edit/delete/reorder
 * recommendations for one episode, then Save writes the whole list back in
 * one Server Action call (recommendation-actions.ts). Same interaction shape
 * as the Transcript/MindMap editors (local state, one Save), even though a
 * Recommendation is a real relational row per item rather than a Json blob
 * -- see lib/admin/content/recommendations.ts for how Save reconciles that.
 *
 * Every field is shown for every type: RecommendationCard
 * (recommendations-panel.tsx) renders title/description/reason/url/imageUrl/
 * timestampSeconds identically regardless of type, only the icon/label/CTA
 * differ -- there is no type-specific field restriction in the current
 * renderer to encode here, so this editor doesn't invent one. The type badge
 * (reusing the exact same typeMeta the public card reads from) is what makes
 * the form feel type-aware instead of one giant generic form.
 *
 * Never touches RecommendationsPanel, EpisodeKnowledgeTabs, or any public
 * rendering code -- this writes to the same Recommendation rows the public
 * page already reads.
 */

function createDraft(): RecommendationDraft {
  return { id: crypto.randomUUID(), type: RecommendationType.YOUTUBE, title: "" };
}

function moveItem(items: RecommendationDraft[], id: string, direction: "up" | "down"): RecommendationDraft[] {
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return items;
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= items.length) return items;
  const next = [...items];
  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  return next;
}

function typeOptionsFor(current: RecommendationType): RecommendationType[] {
  return CREATABLE_RECOMMENDATION_TYPES.includes(current)
    ? [...CREATABLE_RECOMMENDATION_TYPES]
    : [...CREATABLE_RECOMMENDATION_TYPES, current];
}

function RecommendationRow({
  item,
  canMoveUp,
  canMoveDown,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  item: RecommendationDraft;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onUpdate: (id: string, patch: Partial<RecommendationDraft>) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const meta = typeMeta[item.type];
  const Icon = meta.icon;

  return (
    <li className="grid gap-4 rounded-2xl border border-[var(--line-soft)] bg-white/40 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="eyebrow inline-flex items-center gap-1.5">
          <Icon size={14} aria-hidden="true" />
          {meta.label}
        </span>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onMoveUp(item.id)}
            disabled={!canMoveUp}
            aria-label="نقل التوصية للأعلى"
            title="نقل للأعلى"
            className="admin-icon-btn"
          >
            <ChevronUp size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onMoveDown(item.id)}
            disabled={!canMoveDown}
            aria-label="نقل التوصية للأسفل"
            title="نقل للأسفل"
            className="admin-icon-btn"
          >
            <ChevronDown size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            aria-label="حذف التوصية"
            title="حذف"
            className="admin-icon-btn admin-icon-btn--danger"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
        <div>
          <label htmlFor={`type-${item.id}`} className="admin-label">
            النوع
          </label>
          <select
            id={`type-${item.id}`}
            value={item.type}
            onChange={(e) => onUpdate(item.id, { type: e.target.value as RecommendationType })}
            className="admin-field"
          >
            {typeOptionsFor(item.type).map((type) => (
              <option value={type} key={type}>
                {typeMeta[type].label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`title-${item.id}`} className="admin-label">
            العنوان
          </label>
          <input
            id={`title-${item.id}`}
            value={item.title}
            onChange={(e) => onUpdate(item.id, { title: e.target.value })}
            className="admin-field"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`url-${item.id}`} className="admin-label">
            الرابط (اختياري)
          </label>
          <input
            id={`url-${item.id}`}
            value={item.url ?? ""}
            onChange={(e) => onUpdate(item.id, { url: e.target.value.trim() === "" ? undefined : e.target.value })}
            type="url"
            dir="ltr"
            inputMode="url"
            placeholder="https://…"
            className="admin-field"
          />
        </div>
        <div>
          <label htmlFor={`image-${item.id}`} className="admin-label">
            رابط الصورة (اختياري)
          </label>
          <input
            id={`image-${item.id}`}
            value={item.imageUrl ?? ""}
            onChange={(e) => onUpdate(item.id, { imageUrl: e.target.value.trim() === "" ? undefined : e.target.value })}
            type="url"
            dir="ltr"
            inputMode="url"
            placeholder="https://…"
            className="admin-field"
          />
        </div>
      </div>

      <div>
        <label htmlFor={`desc-${item.id}`} className="admin-label">
          الوصف (اختياري)
        </label>
        <textarea
          id={`desc-${item.id}`}
          value={item.description ?? ""}
          onChange={(e) => onUpdate(item.id, { description: e.target.value.trim() === "" ? undefined : e.target.value })}
          rows={2}
          className="admin-field"
        />
      </div>

      <div>
        <label htmlFor={`reason-${item.id}`} className="admin-label">
          سبب الذكر (اختياري)
        </label>
        <textarea
          id={`reason-${item.id}`}
          value={item.reason ?? ""}
          onChange={(e) => onUpdate(item.id, { reason: e.target.value.trim() === "" ? undefined : e.target.value })}
          rows={2}
          className="admin-field"
        />
      </div>

      <div className="sm:w-1/3">
        <label htmlFor={`ts-${item.id}`} className="admin-label">
          توقيت الذكر في الحلقة (ثانية، اختياري)
        </label>
        <input
          id={`ts-${item.id}`}
          type="number"
          min={0}
          dir="ltr"
          value={item.timestampSeconds ?? ""}
          onChange={(e) =>
            onUpdate(item.id, {
              timestampSeconds: e.target.value.trim() === "" ? undefined : Number(e.target.value),
            })
          }
          className="admin-field"
        />
        <p className="meta mt-1.5">
          {typeof item.timestampSeconds === "number" ? (
            <>
              يُذكر عند <span dir="ltr">{formatTimestamp(item.timestampSeconds)}</span>
            </>
          ) : (
            "بلا توقيت داخل الحلقة"
          )}
        </p>
      </div>
    </li>
  );
}

export function RecommendationEditor({
  episodeId,
  initialItems,
}: {
  episodeId: string;
  initialItems: RecommendationDraft[];
}) {
  const router = useRouter();

  const [items, setItems] = useState<RecommendationDraft[]>(initialItems);
  const [saveState, setSaveState] = useState<{ error?: string; success?: boolean }>({});
  const [isSaving, startSave] = useTransition();

  function addItem() {
    setItems((prev) => [...prev, createDraft()]);
    setSaveState({});
  }

  function updateItem(id: string, patch: Partial<RecommendationDraft>) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function handleMoveUp(id: string) {
    setItems((prev) => moveItem(prev, id, "up"));
  }

  function handleMoveDown(id: string) {
    setItems((prev) => moveItem(prev, id, "down"));
  }

  function handleSave() {
    setSaveState({});
    startSave(async () => {
      const result = await saveRecommendationsAction(episodeId, items);
      if (!result.ok) {
        setSaveState({ error: result.error });
        return;
      }
      setSaveState({ success: true });
      router.refresh();
    });
  }

  return (
    <section className="admin-panel grid gap-6 p-5 sm:p-8" aria-labelledby="recommendations-heading">
      <div>
        <h2 id="recommendations-heading" className="text-lg font-black tracking-[-.01em]">
          التوصيات
        </h2>
        <p className="mt-1 text-sm leading-7 text-[var(--ink-soft)]">
          تُعرض هذه التوصيات للزوار في تبويب &quot;التوصيات&quot; على صفحة الحلقة العامة -- كتب وروابط ومحتوى ذُكر في الحلقة. التوقيت هنا هو لحظة الذكر داخل الحلقة، وهو مختلف عن فصول خريطة الحلقة.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState title="لا توجد توصيات لهذه الحلقة." description="أضف كتابًا أو رابطًا أو محتوى ذُكر في الحلقة." />
      ) : (
        <ul className="grid gap-4">
          {items.map((item, index) => (
            <RecommendationRow
              key={item.id}
              item={item}
              canMoveUp={index > 0}
              canMoveDown={index < items.length - 1}
              onUpdate={updateItem}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onDelete={removeItem}
            />
          ))}
        </ul>
      )}

      <Button
        type="button"
        variant="secondary"
        className="w-fit"
        onClick={addItem}
        icon={<Plus size={16} aria-hidden="true" />}
        iconPosition="start"
      >
        إضافة توصية
      </Button>

      {saveState.error && (
        <p role="alert" className="admin-notice admin-notice--danger font-bold">
          <CircleAlert size={17} aria-hidden="true" />
          {saveState.error}
        </p>
      )}
      {saveState.success && (
        <p role="status" className="admin-notice admin-notice--success font-bold">
          <CircleCheck size={17} aria-hidden="true" />
          تم حفظ التوصيات.
        </p>
      )}

      <div className="border-t border-[var(--line-soft)] pt-6">
        <Button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          aria-busy={isSaving}
          icon={isSaving ? <Loader2 className="animate-spin" size={16} aria-hidden="true" /> : undefined}
          iconPosition="start"
        >
          {isSaving ? "جارٍ الحفظ…" : "حفظ التوصيات"}
        </Button>
      </div>
    </section>
  );
}
