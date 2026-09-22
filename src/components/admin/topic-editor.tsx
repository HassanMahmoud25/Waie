"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CircleAlert, CircleCheck, ExternalLink, Loader2, Tag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EPISODE_FORMS, SERIES_FORMS, formatArabicDate, formatCount } from "@/lib/utils/format";
import { updateTopicAction, deleteTopicAction } from "@/lib/admin/content/topic-actions";
import type { getTopicForAdmin } from "@/lib/admin/content/topics";

type AdminTopic = NonNullable<Awaited<ReturnType<typeof getTopicForAdmin>>>;

/**
 * The Phase 3C topic editor. Simpler than the series/episode editors on
 * purpose -- topics are plain taxonomy, with no status/publish workflow
 * (see prisma/schema.prisma). Every mutation goes straight through
 * topic-actions.ts.
 */
export function TopicEditor({ topic }: { topic: AdminTopic }) {
  const router = useRouter();

  const [title, setTitle] = useState(topic.title);
  const [description, setDescription] = useState(topic.description ?? "");
  const [color, setColor] = useState(topic.color ?? "");
  const [seoTitle, setSeoTitle] = useState(topic.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(topic.seoDescription ?? "");

  const [saveState, setSaveState] = useState<{ error?: string; success?: boolean }>({});
  const [isSaving, startSave] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDelete] = useTransition();

  const episodeCount = topic._count.episodes;
  const seriesCount = topic._count.series;
  const inUse = episodeCount > 0 || seriesCount > 0;

  function handleSave() {
    setSaveState({});
    startSave(async () => {
      const result = await updateTopicAction(topic.id, {
        title,
        description,
        color,
        seoTitle: seoTitle.trim() === "" ? null : seoTitle,
        seoDescription: seoDescription.trim() === "" ? null : seoDescription,
      });
      if (!result.ok) {
        setSaveState({ error: result.error });
        return;
      }
      setSaveState({ success: true });
      router.refresh();
    });
  }

  function handleDelete() {
    if (!window.confirm(`حذف "${topic.title}" نهائيًا؟ لا يمكن التراجع عن هذا الإجراء.`)) return;
    setDeleteError(null);
    startDelete(async () => {
      const result = await deleteTopicAction(topic.id);
      if (!result.ok) {
        setDeleteError(result.error);
        return;
      }
      router.push("/admin/topics");
    });
  }

  return (
    <div className="grid gap-6">
      {/* Read-only identity info -- slug is generated once and never hand-edited. */}
      <div className="admin-panel flex flex-wrap items-center gap-4 p-5">
        <span
          className="admin-tile"
          style={{
            color: topic.color ?? "var(--accent)",
            backgroundColor: `color-mix(in srgb, ${topic.color ?? "var(--accent)"} 14%, transparent)`,
            borderColor: `color-mix(in srgb, ${topic.color ?? "var(--accent)"} 22%, transparent)`,
          }}
        >
          <Tag size={19} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="admin-row__title">{topic.title}</p>
          <p className="meta mt-1">
            <span dir="ltr">/topics/{topic.slug}</span>
            <span>{formatCount(episodeCount, EPISODE_FORMS)}</span>
            <span>{formatCount(seriesCount, SERIES_FORMS)}</span>
            <span>أُنشئ {formatArabicDate(topic.createdAt)}</span>
          </p>
        </div>
        <Link href={`/topics/${topic.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary shrink-0">
          <ExternalLink size={15} aria-hidden="true" />
          فتح الصفحة العامة
        </Link>
      </div>

      {/* Editorial content -- the only fields Save ever writes. */}
      <div className="admin-panel grid gap-6 p-5 sm:p-8">
        <div>
          <label htmlFor="title" className="admin-label">
            العنوان
          </label>
          <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="admin-field" />
        </div>

        <div>
          <label htmlFor="description" className="admin-label">
            الوصف
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="admin-field"
          />
        </div>

        <div className="sm:max-w-xs">
          <label htmlFor="color" className="admin-label">
            اللون
          </label>
          <input
            id="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            dir="ltr"
            placeholder="#22c55e أو var(--accent)"
            aria-describedby="color-hint"
            className="admin-field"
          />
          <p id="color-hint" className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
            يُستخدم للون شارة الموضوع في الموقع العام.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="seoTitle" className="admin-label">
              عنوان SEO (اختياري)
            </label>
            <input id="seoTitle" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className="admin-field" />
          </div>
          <div>
            <label htmlFor="seoDescription" className="admin-label">
              وصف SEO (اختياري)
            </label>
            <input
              id="seoDescription"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              className="admin-field"
            />
          </div>
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
          <Button href="/admin/topics" variant="secondary">
            رجوع
          </Button>
        </div>
      </div>

      {/* Delete -- only ever safe when nothing references this topic; the server independently re-checks this regardless of what these counts show here. */}
      <div className="admin-panel admin-panel--dashed flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="font-bold">حذف الموضوع</p>
          <p className="mt-1 text-sm leading-7 text-[var(--ink-soft)]">
            {inUse
              ? `لا يمكن الحذف حاليًا: مستخدم في ${formatCount(episodeCount, EPISODE_FORMS)} و${formatCount(seriesCount, SERIES_FORMS)}.`
              : "غير مستخدم في أي حلقة أو سلسلة -- يمكن حذفه بأمان."}
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
          disabled={inUse || isDeleting}
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
