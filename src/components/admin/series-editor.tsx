"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CircleAlert, CircleCheck, ExternalLink, Layers, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import { EPISODE_FORMS, formatArabicDate, formatCount } from "@/lib/utils/format";
import {
  updateSeriesContentAction,
  publishSeriesAction,
  unpublishSeriesAction,
  deleteSeriesAction,
} from "@/lib/admin/content/series-actions";
import type { getSeriesForAdmin } from "@/lib/admin/content/series";
import type { TopicWithStats } from "@/types/topic";

type AdminSeries = NonNullable<Awaited<ReturnType<typeof getSeriesForAdmin>>>;

/**
 * The Phase 3C series editor. Every mutation goes straight through one of
 * the series-actions.ts Server Actions -- this component never talks to
 * Prisma. `slug` is shown read-only (generated once at creation, see
 * lib/admin/content/series.ts) and `status` only ever changes through the
 * dedicated publish/unpublish controls, never through Save.
 */
export function SeriesEditor({ series, topics }: { series: AdminSeries; topics: TopicWithStats[] }) {
  const router = useRouter();

  const [status, setStatus] = useState(series.status);
  const [title, setTitle] = useState(series.title);
  const [description, setDescription] = useState(series.description ?? "");
  const [topicId, setTopicId] = useState(series.topicId ?? "");
  const [coverImage, setCoverImage] = useState(series.coverImage ?? "");
  const [coverImageMobile, setCoverImageMobile] = useState(series.coverImageMobile ?? "");
  const [seoTitle, setSeoTitle] = useState(series.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(series.seoDescription ?? "");

  const [saveState, setSaveState] = useState<{ error?: string; success?: boolean }>({});
  const [isSaving, startSave] = useTransition();
  const [publishError, setPublishError] = useState<string | null>(null);
  const [isPublishing, startPublish] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDelete] = useTransition();

  const episodeCount = series._count.episodes;

  function handleSave() {
    setSaveState({});
    startSave(async () => {
      const result = await updateSeriesContentAction(series.id, {
        title,
        description,
        topicId: topicId || null,
        coverImage,
        coverImageMobile,
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

  function handlePublishToggle() {
    setPublishError(null);
    startPublish(async () => {
      const action = status === "PUBLISHED" ? unpublishSeriesAction : publishSeriesAction;
      const result = await action(series.id);
      if (!result.ok) {
        setPublishError(result.error);
        return;
      }
      setStatus(status === "PUBLISHED" ? "DRAFT" : "PUBLISHED");
      router.refresh();
    });
  }

  function handleDelete() {
    if (!window.confirm(`حذف "${series.title}" نهائيًا؟ لا يمكن التراجع عن هذا الإجراء.`)) return;
    setDeleteError(null);
    startDelete(async () => {
      const result = await deleteSeriesAction(series.id);
      if (!result.ok) {
        setDeleteError(result.error);
        return;
      }
      router.push("/admin/series");
    });
  }

  return (
    <div className="grid gap-6">
      {/* Publish workflow: its own card, separate from the content form. */}
      <div className="admin-panel flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          <StatusBadge status={status} />
          <p className="meta">{status === "PUBLISHED" ? "ظاهرة على الموقع العام." : "غير ظاهرة على الموقع العام."}</p>
        </div>
        <div className="flex items-center gap-3">
          {publishError && (
            <p role="alert" className="admin-notice admin-notice--danger text-sm font-bold">
              <CircleAlert size={16} aria-hidden="true" />
              {publishError}
            </p>
          )}
          <Button
            variant={status === "PUBLISHED" ? "secondary" : "primary"}
            onClick={handlePublishToggle}
            disabled={isPublishing}
            aria-busy={isPublishing}
            icon={isPublishing ? <Loader2 className="animate-spin" size={16} aria-hidden="true" /> : undefined}
            iconPosition="start"
          >
            {isPublishing ? "جارٍ التنفيذ…" : status === "PUBLISHED" ? "إلغاء النشر" : "نشر السلسلة"}
          </Button>
        </div>
      </div>

      {/* Read-only identity info -- slug is generated once and never hand-edited. */}
      <div className="admin-panel flex flex-wrap items-center gap-4 p-5">
        <span className="admin-tile">
          <Layers size={20} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="admin-row__title">{series.title}</p>
          <p className="meta mt-1">
            <span dir="ltr">/series/{series.slug}</span>
            <span>{formatCount(episodeCount, EPISODE_FORMS)}</span>
            <span>أُنشئت {formatArabicDate(series.createdAt)}</span>
          </p>
        </div>
        {status === "PUBLISHED" && (
          <Link href={`/series/${series.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary shrink-0">
            <ExternalLink size={15} aria-hidden="true" />
            فتح الصفحة العامة
          </Link>
        )}
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
            rows={4}
            className="admin-field"
          />
        </div>

        <div>
          <label htmlFor="topicId" className="admin-label">
            الموضوع الرئيسي
          </label>
          <select id="topicId" value={topicId} onChange={(e) => setTopicId(e.target.value)} className="admin-field sm:max-w-xs">
            <option value="">بلا تصنيف</option>
            {topics.map((topic) => (
              <option value={topic.id} key={topic.id}>
                {topic.title}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="coverImage" className="admin-label">
              صورة الغلاف
            </label>
            <input
              id="coverImage"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              type="url"
              dir="ltr"
              placeholder="https://…"
              className="admin-field"
            />
          </div>
          <div>
            <label htmlFor="coverImageMobile" className="admin-label">
              صورة الغلاف (جوال)
            </label>
            <input
              id="coverImageMobile"
              value={coverImageMobile}
              onChange={(e) => setCoverImageMobile(e.target.value)}
              type="url"
              dir="ltr"
              placeholder="https://…"
              className="admin-field"
            />
          </div>
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
          <Button href="/admin/series" variant="secondary">
            رجوع
          </Button>
        </div>
      </div>

      {/* Delete -- only ever safe when the series has no episodes; the server independently re-checks this regardless of what episodeCount shows here. */}
      <div className="admin-panel admin-panel--dashed flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="font-bold">حذف السلسلة</p>
          <p className="mt-1 text-sm leading-7 text-[var(--ink-soft)]">
            {episodeCount > 0
              ? `لا يمكن الحذف حاليًا: ${formatCount(episodeCount, EPISODE_FORMS)} مرتبطة بهذه السلسلة.`
              : "لا حلقات مرتبطة بهذه السلسلة -- يمكن حذفها بأمان."}
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
          disabled={episodeCount > 0 || isDeleting}
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
