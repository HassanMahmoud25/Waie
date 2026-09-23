"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, CircleCheck, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/content/empty-state";
import { saveTranscriptAction, deleteTranscriptAction } from "@/lib/admin/content/transcript-actions";

/**
 * The admin Transcript editor (Phase 5E, simplified in Phase 5H). A
 * transcript is one complete text body, edited like a document -- a single
 * textarea, nothing else. No segments, no per-line timestamps, no speakers:
 * that structure was removed because it never matched the intended product
 * model (Transcript = full text; chapter/timestamp structure belongs to the
 * separate Episode Map). One Save call persists the whole body.
 */
export function TranscriptEditor({
  episodeId,
  initialText,
  hasExistingTranscript,
}: {
  episodeId: string;
  initialText: string;
  hasExistingTranscript: boolean;
}) {
  const router = useRouter();

  const [text, setText] = useState(initialText);
  const [exists, setExists] = useState(hasExistingTranscript);
  const [isEditing, setIsEditing] = useState(hasExistingTranscript);

  const [saveState, setSaveState] = useState<{ error?: string; success?: boolean }>({});
  const [isSaving, startSave] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDelete] = useTransition();

  function handleSave() {
    setSaveState({});
    startSave(async () => {
      const result = await saveTranscriptAction(episodeId, text);
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
      setText("");
      setExists(false);
      setIsEditing(false);
      setSaveState({});
      router.refresh();
    });
  }

  return (
    <section className="admin-panel grid gap-5 p-5 sm:p-8" aria-labelledby="transcript-heading">
      <div>
        <h2 id="transcript-heading" className="text-lg font-black tracking-[-.01em]">
          النص الكامل
        </h2>
        <p className="mt-1 text-sm leading-7 text-[var(--ink-soft)]">
          يُعرض هذا النص كاملًا للزوار في تبويب &quot;النص الكامل&quot; على صفحة الحلقة العامة.
        </p>
      </div>

      {!isEditing ? (
        <>
          <EmptyState title="لا يوجد نص لهذه الحلقة بعد." description="أضف النص الكامل للحلقة ليظهر للزوار." />
          <Button type="button" variant="secondary" className="w-fit" onClick={() => setIsEditing(true)}>
            كتابة النص
          </Button>
        </>
      ) : (
        <>
          <div>
            <label htmlFor="transcript-text" className="admin-label sr-only">
              النص الكامل
            </label>
            <textarea
              id="transcript-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="اكتب أو الصق النص الكامل للحلقة هنا…"
              className="admin-field min-h-[420px] text-base leading-8"
            />
          </div>

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

          <div className="flex flex-wrap items-center gap-3 border-t border-[var(--line-soft)] pt-5">
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
        </>
      )}
    </section>
  );
}
