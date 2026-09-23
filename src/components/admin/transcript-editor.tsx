"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, CircleCheck, ChevronUp, ChevronDown, Loader2, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/content/empty-state";
import { formatTimestamp } from "@/lib/utils/format";
import { saveTranscriptAction, deleteTranscriptAction } from "@/lib/admin/content/transcript-actions";
import type { TranscriptSegment } from "@/types/transcript";

/**
 * The Phase 5E admin Transcript editor -- add/edit/delete/reorder segments
 * for one episode, then Save writes the whole array back to Transcript.segments
 * in one Server Action call (transcript-actions.ts). There is no per-segment
 * persistence: unlike Collection episodes (separate relational rows, so
 * add/remove/move each need their own action), a transcript is one Json
 * blob, so add/edit/delete/reorder are all local state here and only Save
 * ever talks to the server -- exactly like every other editor in this app
 * (see episode-editor.tsx), never autosave.
 *
 * Never touches TranscriptReader, EpisodeKnowledgeTabs, or any public
 * rendering code -- this writes to the same Transcript row the public page
 * already reads, nothing more.
 */
export function TranscriptEditor({
  episodeId,
  initialSegments,
  hasExistingTranscript,
}: {
  episodeId: string;
  initialSegments: TranscriptSegment[];
  hasExistingTranscript: boolean;
}) {
  const router = useRouter();

  const [segments, setSegments] = useState<TranscriptSegment[]>(initialSegments);
  const [exists, setExists] = useState(hasExistingTranscript);

  const [saveState, setSaveState] = useState<{ error?: string; success?: boolean }>({});
  const [isSaving, startSave] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDelete] = useTransition();

  function updateSegment(id: string, patch: Partial<TranscriptSegment>) {
    setSegments((prev) => prev.map((segment) => (segment.id === id ? { ...segment, ...patch } : segment)));
  }

  function removeSegment(id: string) {
    setSegments((prev) => prev.filter((segment) => segment.id !== id));
  }

  function moveSegment(index: number, direction: "up" | "down") {
    setSegments((prev) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  }

  function addSegment() {
    const last = segments[segments.length - 1];
    const startSeconds = last ? (last.endSeconds ?? last.startSeconds + 1) : 0;
    setSegments((prev) => [...prev, { id: crypto.randomUUID(), startSeconds, text: "" }]);
  }

  function handleSave() {
    setSaveState({});
    startSave(async () => {
      const result = await saveTranscriptAction(episodeId, segments);
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
    if (!window.confirm("حذف النص الكامل لهذه الحلقة نهائيًا؟ لن يؤثر هذا على أي شيء آخر في الحلقة. لا يمكن التراجع عن هذا الإجراء.")) return;
    setDeleteError(null);
    startDelete(async () => {
      const result = await deleteTranscriptAction(episodeId);
      if (!result.ok) {
        setDeleteError(result.error);
        return;
      }
      setSegments([]);
      setExists(false);
      setSaveState({});
      router.refresh();
    });
  }

  return (
    <section className="admin-panel grid gap-6 p-5 sm:p-8" aria-labelledby="transcript-heading">
      <div>
        <h2 id="transcript-heading" className="text-lg font-black tracking-[-.01em]">
          النص الكامل
        </h2>
        <p className="mt-1 text-sm leading-7 text-[var(--ink-soft)]">
          يُعرض هذا النص للزوار في تبويب &quot;النص الكامل&quot; على صفحة الحلقة العامة، مع أزرار توقيت تنقل المشغّل مباشرة إلى بداية كل مقطع.
        </p>
      </div>

      {segments.length === 0 ? (
        <EmptyState title="لا يوجد نص لهذه الحلقة بعد." description="أضف أول مقطع لبدء كتابة النص." />
      ) : (
        <div className="admin-panel">
          {segments.map((segment, index) => (
            <div key={segment.id} className="admin-row flex-col items-stretch gap-4 sm:flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor={`start-${segment.id}`} className="admin-label">
                      البداية (ثانية)
                    </label>
                    <input
                      id={`start-${segment.id}`}
                      type="number"
                      min={0}
                      dir="ltr"
                      value={segment.startSeconds}
                      onChange={(e) => updateSegment(segment.id, { startSeconds: Number(e.target.value) })}
                      className="admin-field"
                    />
                    <p className="meta mt-1" dir="ltr">
                      {formatTimestamp(segment.startSeconds)}
                    </p>
                  </div>
                  <div>
                    <label htmlFor={`end-${segment.id}`} className="admin-label">
                      النهاية (ثانية، اختياري)
                    </label>
                    <input
                      id={`end-${segment.id}`}
                      type="number"
                      min={0}
                      dir="ltr"
                      value={segment.endSeconds ?? ""}
                      onChange={(e) =>
                        updateSegment(segment.id, {
                          endSeconds: e.target.value.trim() === "" ? undefined : Number(e.target.value),
                        })
                      }
                      className="admin-field"
                    />
                    {segment.endSeconds != null && (
                      <p className="meta mt-1" dir="ltr">
                        {formatTimestamp(segment.endSeconds)}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label htmlFor={`speaker-${segment.id}`} className="admin-label">
                      المتحدث (اختياري)
                    </label>
                    <input
                      id={`speaker-${segment.id}`}
                      value={segment.speaker ?? ""}
                      onChange={(e) => updateSegment(segment.id, { speaker: e.target.value.trim() === "" ? undefined : e.target.value })}
                      className="admin-field"
                    />
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => moveSegment(index, "up")}
                    disabled={index === 0}
                    aria-label="نقل المقطع للأعلى"
                    className="btn btn-ghost size-11 min-h-0 rounded-full p-0"
                  >
                    <ChevronUp size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSegment(index, "down")}
                    disabled={index === segments.length - 1}
                    aria-label="نقل المقطع للأسفل"
                    className="btn btn-ghost size-11 min-h-0 rounded-full p-0"
                  >
                    <ChevronDown size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSegment(segment.id)}
                    aria-label="حذف المقطع"
                    className="btn btn-danger size-11 min-h-0 rounded-full p-0"
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor={`text-${segment.id}`} className="admin-label">
                  النص
                </label>
                <textarea
                  id={`text-${segment.id}`}
                  value={segment.text}
                  onChange={(e) => updateSegment(segment.id, { text: e.target.value })}
                  rows={2}
                  required
                  className="admin-field"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="secondary"
        onClick={addSegment}
        className="w-fit"
        icon={<Plus size={16} aria-hidden="true" />}
        iconPosition="start"
      >
        إضافة مقطع
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
          تم حفظ النص.
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
          {isSaving ? "جارٍ الحفظ…" : "حفظ النص"}
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
              حذف النص بالكامل
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
