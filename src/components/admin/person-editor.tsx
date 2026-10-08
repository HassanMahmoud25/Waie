"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useInvalidateAfterMutation } from "@/hooks/use-content-queries";
import { CircleAlert, CircleCheck, Loader2, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EPISODE_FORMS, formatArabicDate, formatCount } from "@/lib/utils/format";
import { updatePersonAction, deletePersonAction } from "@/lib/admin/content/person-actions";
import type { getPersonForAdmin } from "@/lib/admin/content/people";

type AdminPerson = NonNullable<Awaited<ReturnType<typeof getPersonForAdmin>>>;

/**
 * The People CMS editor -- as simple as topic-editor.tsx (no status/publish
 * workflow, just name + image). The one deliberate difference from
 * deleteTopic's "refuse while still in use" rule: deleting a Person always
 * cascades (see lib/admin/content/people.ts's own comment on deletePerson),
 * so the confirmation copy here explicitly names how many episodes will lose
 * this participant instead of blocking the action.
 */
export function PersonEditor({ person }: { person: AdminPerson }) {
  const router = useRouter();
  const invalidateQueries = useInvalidateAfterMutation();

  const [name, setName] = useState(person.name);
  const [imageUrl, setImageUrl] = useState(person.imageUrl ?? "");

  const [saveState, setSaveState] = useState<{ error?: string; success?: boolean }>({});
  const [isSaving, startSave] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDelete] = useTransition();

  const episodeCount = person._count.episodeParticipants;

  function handleSave() {
    setSaveState({});
    startSave(async () => {
      const result = await updatePersonAction(person.id, { name, imageUrl });
      if (!result.ok) {
        setSaveState({ error: result.error });
        return;
      }
      setSaveState({ success: true });
      invalidateQueries("person");
      router.refresh();
    });
  }

  function handleDelete() {
    const warning =
      episodeCount > 0
        ? `حذف "${person.name}" نهائيًا؟ سيُزال تلقائيًا من ${formatCount(episodeCount, EPISODE_FORMS)} تعرضه حاليًا كمشارك. لا يمكن التراجع عن هذا الإجراء.`
        : `حذف "${person.name}" نهائيًا؟ لا يمكن التراجع عن هذا الإجراء.`;
    if (!window.confirm(warning)) return;
    setDeleteError(null);
    startDelete(async () => {
      const result = await deletePersonAction(person.id);
      if (!result.ok) {
        setDeleteError(result.error);
        return;
      }
      invalidateQueries("person");
      router.push("/admin/people");
    });
  }

  return (
    <div className="grid gap-6">
      {/* Read-only identity info -- a live preview of the image URL below. */}
      <div className="admin-panel flex flex-wrap items-center gap-4 p-5">
        <span className="admin-tile overflow-hidden">
          {imageUrl ? (
            <Image src={imageUrl} alt="" width={44} height={44} unoptimized className="h-full w-full object-cover" />
          ) : (
            <User size={19} aria-hidden="true" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="admin-row__title">{person.name}</p>
          <p className="meta mt-1">
            <span>{formatCount(episodeCount, EPISODE_FORMS)}</span>
            <span>أُنشئ {formatArabicDate(person.createdAt)}</span>
          </p>
        </div>
      </div>

      {/* Editorial content -- the only fields Save ever writes. */}
      <div className="admin-panel grid gap-6 p-5 sm:p-8">
        <div>
          <label htmlFor="name" className="admin-label">
            الاسم
          </label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="admin-field" />
        </div>

        <div>
          <label htmlFor="imageUrl" className="admin-label">
            رابط الصورة (اختياري)
          </label>
          <input
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            dir="ltr"
            inputMode="url"
            placeholder="https://... أو /people/..."
            aria-describedby="imageUrl-hint"
            className="admin-field"
          />
          <p id="imageUrl-hint" className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
            رابط مباشر لصورة الشخص، أو مسار داخلي يبدأ بـ /. يظهر هذا الشخص بالصورة نفسها في كل حلقة يُضاف إليها كمشارك.
          </p>
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
            تم حفظ التعديلات.
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-[var(--line-soft)] pt-6 sm:flex-row sm:items-center">
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            aria-busy={isSaving}
            icon={isSaving ? <Loader2 className="animate-spin" size={16} aria-hidden="true" /> : undefined}
            iconPosition="start"
          >
            {isSaving ? "جارٍ الحفظ…" : "حفظ التعديلات"}
          </Button>
          <Button href="/admin/people" variant="secondary">
            رجوع
          </Button>
        </div>
      </div>

      {/* Delete -- unlike topics, this never refuses: it always cascades off every episode's participant list, so the confirmation dialog is the only safeguard. */}
      <div className="admin-panel admin-panel--dashed flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="font-bold">حذف الشخص</p>
          <p className="mt-1 text-sm leading-7 text-[var(--ink-soft)]">
            {episodeCount > 0
              ? `سيُزال تلقائيًا من ${formatCount(episodeCount, EPISODE_FORMS)} تعرضه حاليًا كمشارك.`
              : "غير مضاف كمشارك في أي حلقة حاليًا."}
          </p>
          {deleteError && (
            <p role="alert" className="admin-notice admin-notice--danger mt-3 text-sm font-bold">
              <CircleAlert size={16} aria-hidden="true" />
              {deleteError}
            </p>
          )}
        </div>
        <Button
          variant="danger"
          onClick={handleDelete}
          disabled={isDeleting}
          aria-busy={isDeleting}
          icon={isDeleting ? <Loader2 className="animate-spin" size={16} aria-hidden="true" /> : <Trash2 size={16} aria-hidden="true" />}
          iconPosition="start"
        >
          {isDeleting ? "جارٍ الحذف…" : "حذف نهائي"}
        </Button>
      </div>
    </div>
  );
}
