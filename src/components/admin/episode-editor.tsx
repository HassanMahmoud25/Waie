"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CircleAlert, CircleCheck, ExternalLink, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import { EpisodeThumbnail } from "@/components/content/episode-thumbnail";
import { EpisodeDeleteModal } from "@/components/admin/episode-delete-modal";
import { formatArabicDate, formatDuration } from "@/lib/utils/format";
import {
  updateEpisodeContentAction,
  publishEpisodeAction,
  unpublishEpisodeAction,
  deleteEpisodeAction,
} from "@/lib/admin/content/actions";
import type { getEpisodeForAdmin } from "@/lib/admin/content/episodes";
import type { SeriesWithStats } from "@/types/series";
import type { TopicWithStats } from "@/types/topic";

type AdminEpisode = NonNullable<Awaited<ReturnType<typeof getEpisodeForAdmin>>>;

/**
 * The Phase 3B rich episode editor. Every mutation goes straight through one
 * of the three Phase 3A actions (update/publish/unpublish) -- this component
 * never talks to Prisma or re-implements their rules (e.g. the "needs a
 * series or topic to publish" check lives only in publishEpisode(), and a
 * rejection from it is just displayed, never guessed at beforehand).
 *
 * youtube*-prefixed fields are sync-owned (see prisma/schema.prisma) and are
 * shown read-only here; only the editorial fields below are ever sent to
 * updateEpisodeContentAction.
 */
export function EpisodeEditor({
  episode,
  series,
  topics,
}: {
  episode: AdminEpisode;
  series: SeriesWithStats[];
  topics: TopicWithStats[];
}) {
  const router = useRouter();

  const [status, setStatus] = useState(episode.status);
  const [title, setTitle] = useState(episode.title ?? episode.youtubeTitle);
  const [description, setDescription] = useState(episode.description ?? episode.youtubeDescription ?? "");
  const [seriesId, setSeriesId] = useState(episode.seriesId ?? "");
  const [topicIds, setTopicIds] = useState<string[]>(episode.topics.map((t) => t.topicId));
  const [episodeNumber, setEpisodeNumber] = useState(episode.episodeNumber?.toString() ?? "");
  const [featured, setFeatured] = useState(episode.featured);
  const [audioUrl, setAudioUrl] = useState(episode.audioUrl ?? "");
  const [seoTitle, setSeoTitle] = useState(episode.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(episode.seoDescription ?? "");

  const [saveState, setSaveState] = useState<{ error?: string; success?: boolean }>({});
  const [isSaving, startSave] = useTransition();
  const [publishError, setPublishError] = useState<string | null>(null);
  const [isPublishing, startPublish] = useTransition();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDelete] = useTransition();

  function handleSave() {
    setSaveState({});
    startSave(async () => {
      const result = await updateEpisodeContentAction(episode.id, {
        title,
        description,
        seriesId: seriesId || null,
        topicIds,
        episodeNumber: episodeNumber.trim() === "" ? null : Number(episodeNumber),
        featured,
        audioUrl,
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
      const action = status === "PUBLISHED" ? unpublishEpisodeAction : publishEpisodeAction;
      const result = await action(episode.id);
      if (!result.ok) {
        setPublishError(result.error);
        return;
      }
      setStatus(status === "PUBLISHED" ? "DRAFT" : "PUBLISHED");
      router.refresh();
    });
  }

  function handleCancelDelete() {
    if (isDeleting) return;
    setShowDeleteModal(false);
    setDeleteError(null);
  }

  function handleConfirmDelete() {
    setDeleteError(null);
    startDelete(async () => {
      const result = await deleteEpisodeAction(episode.id);
      if (!result.ok) {
        setDeleteError(result.error);
        return;
      }
      router.push("/admin/episodes");
    });
  }

  return (
    <div className="grid gap-6">
      {/* Publish workflow: its own card, separate from the content form -- publishing is a
          distinct action with its own server-side rule, never a side effect of Save. */}
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
            {isPublishing ? "جارٍ التنفيذ…" : status === "PUBLISHED" ? "إلغاء النشر" : "نشر الحلقة"}
          </Button>
        </div>
      </div>

      {/* Read-only YouTube source info -- never editable from this form. */}
      <div className="admin-panel flex flex-wrap items-center gap-4 p-5">
        <div className="admin-thumb">
          <EpisodeThumbnail src={episode.youtubeThumbnailUrl} alt="" fill sizes="128px" className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="admin-row__title">{episode.youtubeTitle}</p>
          <p className="meta mt-1">
            <span>{formatDuration(episode.youtubeDurationSeconds)}</span>
            <span>{formatArabicDate(episode.youtubePublishedAt)}</span>
          </p>
        </div>
        <a
          href={episode.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary shrink-0"
        >
          <ExternalLink size={15} aria-hidden="true" />
          فتح على يوتيوب
        </a>
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
            rows={5}
            className="admin-field"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="seriesId" className="admin-label">
              السلسلة
            </label>
            <select id="seriesId" value={seriesId} onChange={(e) => setSeriesId(e.target.value)} className="admin-field">
              <option value="">بلا سلسلة</option>
              {series.map((s) => (
                <option value={s.id} key={s.id}>
                  {s.title}
                  {s.status === "DRAFT" ? " (مسودة)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="episodeNumber" className="admin-label">
              رقم الحلقة (وعي)
            </label>
            <input
              id="episodeNumber"
              type="number"
              min={1}
              value={episodeNumber}
              onChange={(e) => setEpisodeNumber(e.target.value)}
              className="admin-field"
              dir="ltr"
            />
          </div>
        </div>

        <div>
          <label htmlFor="topicIds" className="admin-label">
            المواضيع
          </label>
          <select
            id="topicIds"
            multiple
            size={Math.min(8, Math.max(4, topics.length))}
            value={topicIds}
            onChange={(e) => setTopicIds(Array.from(e.target.selectedOptions, (option) => option.value))}
            className="admin-field"
          >
            {topics.map((topic) => (
              <option value={topic.id} key={topic.id}>
                {topic.title}
              </option>
            ))}
          </select>
          <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
            اضغط مع الاستمرار على Ctrl (أو Cmd على ماك) لاختيار أكثر من موضوع.
          </p>
        </div>

        <label className="flex w-fit items-center gap-2 font-bold">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="size-5" />
          حلقة مميّزة
        </label>

        <div>
          <label htmlFor="audioUrl" className="admin-label">
            رابط النسخة الصوتية
          </label>
          <input
            id="audioUrl"
            value={audioUrl}
            onChange={(e) => setAudioUrl(e.target.value)}
            type="url"
            dir="ltr"
            inputMode="url"
            placeholder="https://media.example.com/episodes/waie-111.m4a"
            aria-describedby="audioUrl-hint"
            className="admin-field"
          />
          <p id="audioUrl-hint" className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
            اختياري. يُستخدم تلقائيًا صوت الحلقة من بودكاست وعي عند توفره؛ هذا الحقل لتجاوزه أو لحلقة غير موجودة في البودكاست. يقبل رابط ملف صوتي مباشر، أو رابط حلقة على SoundCloud. اتركه فارغًا للاعتماد على البودكاست. لا تُقبل روابط يوتيوب.
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
          <Button href="/admin/episodes" variant="secondary">
            رجوع
          </Button>
          {status === "PUBLISHED" && (
            <Link href={`/episodes/${episode.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              معاينة الصفحة العامة
            </Link>
          )}
        </div>
      </div>

      {/* Delete -- its own dashed panel, same convention as series-editor.tsx/
          topic-editor.tsx, kept visually separate (and never the default focus)
          from Save/Publish above. */}
      <div className="admin-panel admin-panel--dashed flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="font-bold">حذف الحلقة</p>
          <p className="mt-1 text-sm leading-7 text-[var(--ink-soft)]">
            حذف نهائي لا يمكن التراجع عنه -- يشمل نص الحلقة وتوصياتها وخريطتها، وملاحظات المستخدمين وحفظهم وتقدّمهم فيها.
          </p>
        </div>
        <Button
          variant="danger"
          onClick={() => setShowDeleteModal(true)}
          icon={<Trash2 size={16} aria-hidden="true" />}
          iconPosition="start"
        >
          حذف نهائي
        </Button>
      </div>

      <EpisodeDeleteModal
        episode={showDeleteModal ? { id: episode.id, title } : null}
        isDeleting={isDeleting}
        error={deleteError}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
