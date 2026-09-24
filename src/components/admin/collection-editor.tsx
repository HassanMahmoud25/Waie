"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  CircleAlert,
  CircleCheck,
  ExternalLink,
  FolderOpen,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import { EpisodeThumbnail } from "@/components/content/episode-thumbnail";
import { EPISODE_FORMS, formatArabicDate, formatCount } from "@/lib/utils/format";
import {
  updateCollectionAction,
  publishCollectionAction,
  unpublishCollectionAction,
  deleteCollectionAction,
  addCollectionEpisodeAction,
  removeCollectionEpisodeAction,
  moveCollectionEpisodeAction,
} from "@/lib/admin/content/collection-actions";
import type { getCollectionForAdmin } from "@/lib/admin/content/collections";
import type { Episode } from "@/types/episode";
import type { SeriesWithStats } from "@/types/series";

type AdminCollection = NonNullable<Awaited<ReturnType<typeof getCollectionForAdmin>>>;
type ActionResult = { ok: boolean; error?: string };

const MAX_CANDIDATES_SHOWN = 20;

/**
 * The Phase 3D collection editor. Every mutation goes straight through one
 * of the collection-actions.ts Server Actions -- this component never talks
 * to Prisma. `slug` is shown read-only (generated once at creation) and
 * `status` only ever changes through the dedicated publish/unpublish
 * controls, never through Save.
 *
 * Episode order is derived directly from the `collection` prop (already
 * position-sorted by getCollectionForAdmin's include) rather than copied
 * into local state, so router.refresh() after an add/remove/move is enough
 * to reflect the new order -- the server stays the single source of truth
 * for order, exactly like it is for publish state on Series/Episodes.
 */
export function CollectionEditor({
  collection,
  allEpisodes,
  series,
}: {
  collection: AdminCollection;
  allEpisodes: Episode[];
  series: SeriesWithStats[];
}) {
  const router = useRouter();

  const [status, setStatus] = useState(collection.status);
  const [title, setTitle] = useState(collection.title);
  const [description, setDescription] = useState(collection.description ?? "");
  const [seoTitle, setSeoTitle] = useState(collection.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(collection.seoDescription ?? "");
  const [query, setQuery] = useState("");

  const [saveState, setSaveState] = useState<{ error?: string; success?: boolean }>({});
  const [isSaving, startSave] = useTransition();
  const [publishError, setPublishError] = useState<string | null>(null);
  const [isPublishing, startPublish] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDelete] = useTransition();
  const [assignError, setAssignError] = useState<string | null>(null);
  const [pendingEpisodeId, setPendingEpisodeId] = useState<string | null>(null);
  const [isAssigning, startAssign] = useTransition();

  const seriesById = useMemo(() => new Map(series.map((s) => [s.id, s])), [series]);
  const episodesById = useMemo(() => new Map(allEpisodes.map((e) => [e.id, e])), [allEpisodes]);

  const assignedIds = collection.items.map((item) => item.episodeId);
  const assignedEpisodes = assignedIds.map((id) => episodesById.get(id)).filter((e): e is Episode => Boolean(e));
  const assignedIdSet = new Set(assignedIds);

  const normalizedQuery = query.trim().toLowerCase();
  const allCandidates = allEpisodes.filter(
    (episode) => !assignedIdSet.has(episode.id) && (normalizedQuery === "" || episode.title.toLowerCase().includes(normalizedQuery)),
  );
  const candidates = allCandidates.slice(0, MAX_CANDIDATES_SHOWN);

  function handleSave() {
    setSaveState({});
    startSave(async () => {
      const result = await updateCollectionAction(collection.id, {
        title,
        description,
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
      const action = status === "PUBLISHED" ? unpublishCollectionAction : publishCollectionAction;
      const result = await action(collection.id);
      if (!result.ok) {
        setPublishError(result.error);
        return;
      }
      setStatus(status === "PUBLISHED" ? "DRAFT" : "PUBLISHED");
      router.refresh();
    });
  }

  function handleDelete() {
    if (!window.confirm(`حذف "${collection.title}" نهائيًا؟ لن يؤثر هذا على الحلقات نفسها. لا يمكن التراجع عن هذا الإجراء.`)) return;
    setDeleteError(null);
    startDelete(async () => {
      const result = await deleteCollectionAction(collection.id);
      if (!result.ok) {
        setDeleteError(result.error);
        return;
      }
      router.push("/admin/collections");
    });
  }

  function runAssignment(episodeId: string, action: () => Promise<ActionResult>) {
    setAssignError(null);
    setPendingEpisodeId(episodeId);
    startAssign(async () => {
      const result = await action();
      if (!result.ok) setAssignError(result.error ?? "حدث خطأ غير متوقع.");
      setPendingEpisodeId(null);
      router.refresh();
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
            {isPublishing ? "جارٍ التنفيذ…" : status === "PUBLISHED" ? "إلغاء النشر" : "نشر المجموعة"}
          </Button>
        </div>
      </div>

      {/* Read-only identity info -- slug is generated once and never hand-edited. */}
      <div className="admin-panel flex flex-wrap items-center gap-4 p-5">
        <span className="admin-tile">
          <FolderOpen size={20} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="admin-row__title">{collection.title}</p>
          <p className="meta mt-1">
            <span dir="ltr">/collections/{collection.slug}</span>
            <span>{formatCount(collection._count.items, EPISODE_FORMS)}</span>
            <span>أُنشئت {formatArabicDate(collection.createdAt)}</span>
          </p>
        </div>
        {status === "PUBLISHED" && (
          <Link
            href={`/collections/${collection.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary shrink-0"
          >
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
            rows={3}
            className="admin-field"
          />
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
          <Button href="/admin/collections" variant="secondary">
            رجوع
          </Button>
        </div>
      </div>

      {/* Episode assignment -- the core of this phase. Order comes straight from the collection prop (already position-sorted). */}
      <div className="admin-panel grid gap-4 p-5 sm:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black leading-[1.9]">الحلقات في هذه المجموعة</h2>
          <span className="meta">{formatCount(assignedEpisodes.length, EPISODE_FORMS)}</span>
        </div>

        {assignError && (
          <p role="alert" className="admin-notice admin-notice--danger font-bold">
            <CircleAlert size={17} aria-hidden="true" />
            {assignError}
          </p>
        )}

        {assignedEpisodes.length > 0 ? (
          <div className="admin-panel">
            {assignedEpisodes.map((episode, index) => {
              const isBusy = isAssigning && pendingEpisodeId === episode.id;
              return (
                <div key={episode.id} className="admin-row">
                  <div className="admin-thumb">
                    {episode.thumbnailUrl && (
                      <EpisodeThumbnail src={episode.thumbnailUrl} alt="" fill sizes="128px" className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <StatusBadge status={episode.status} />
                    </div>
                    <p className="admin-row__title">{episode.title}</p>
                    <p className="meta mt-1">
                      {episode.episodeNumber !== null && <span>وعي {episode.episodeNumber}</span>}
                      <span>{seriesById.get(episode.seriesId)?.title ?? "بلا سلسلة"}</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => runAssignment(episode.id, () => moveCollectionEpisodeAction(collection.id, episode.id, "up"))}
                      disabled={index === 0 || isBusy}
                      aria-label={`نقل للأعلى: ${episode.title}`}
                      className="btn btn-ghost size-11 min-h-0 rounded-full p-0"
                    >
                      <ChevronUp size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        runAssignment(episode.id, () => moveCollectionEpisodeAction(collection.id, episode.id, "down"))
                      }
                      disabled={index === assignedEpisodes.length - 1 || isBusy}
                      aria-label={`نقل للأسفل: ${episode.title}`}
                      className="btn btn-ghost size-11 min-h-0 rounded-full p-0"
                    >
                      <ChevronDown size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => runAssignment(episode.id, () => removeCollectionEpisodeAction(collection.id, episode.id))}
                      disabled={isBusy}
                      aria-label={`إزالة: ${episode.title}`}
                      className="btn btn-danger size-11 min-h-0 rounded-full p-0"
                    >
                      {isBusy ? <Loader2 className="animate-spin" size={16} aria-hidden="true" /> : <X size={16} aria-hidden="true" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="admin-notice admin-notice--warning">لم تُضَف أي حلقة إلى هذه المجموعة بعد.</p>
        )}

        <div className="mt-4 border-t border-[var(--line-soft)] pt-6">
          <label htmlFor="episodeSearch" className="admin-label">
            إضافة حلقة
          </label>
          <input
            id="episodeSearch"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث بعنوان الحلقة…"
            className="admin-field"
          />

          <div className="admin-panel mt-3 max-h-96 overflow-y-auto">
            {candidates.length > 0 ? (
              candidates.map((episode) => {
                const isBusy = isAssigning && pendingEpisodeId === episode.id;
                return (
                  <div key={episode.id} className="admin-row">
                    <div className="admin-thumb">
                      {episode.thumbnailUrl && (
                        <EpisodeThumbnail src={episode.thumbnailUrl} alt="" fill sizes="128px" className="object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <StatusBadge status={episode.status} />
                      </div>
                      <p className="admin-row__title">{episode.title}</p>
                      <p className="meta mt-1">
                        {episode.episodeNumber !== null && <span>وعي {episode.episodeNumber}</span>}
                        <span>{seriesById.get(episode.seriesId)?.title ?? "بلا سلسلة"}</span>
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => runAssignment(episode.id, () => addCollectionEpisodeAction(collection.id, episode.id))}
                      disabled={isBusy}
                      aria-busy={isBusy}
                      icon={isBusy ? <Loader2 className="animate-spin" size={15} aria-hidden="true" /> : <Plus size={15} aria-hidden="true" />}
                      iconPosition="start"
                      className="shrink-0"
                    >
                      إضافة
                    </Button>
                  </div>
                );
              })
            ) : (
              <p className="p-5 text-sm text-[var(--ink-soft)]">
                {normalizedQuery ? "لا توجد حلقات مطابقة." : "كل الحلقات مضافة بالفعل إلى هذه المجموعة."}
              </p>
            )}
          </div>
          {allCandidates.length > MAX_CANDIDATES_SHOWN && (
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              تُعرض أول {MAX_CANDIDATES_SHOWN} نتيجة من {allCandidates.length} -- دقّق البحث لعرض المزيد.
            </p>
          )}
        </div>
      </div>

      {/* Delete -- unlike Series/Topic, this is always safe: it only removes this collection's membership rows, never an episode. */}
      <div className="admin-panel admin-panel--dashed flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="font-bold">حذف المجموعة</p>
          <p className="mt-1 text-sm leading-7 text-[var(--ink-soft)]">
            لن يؤثر هذا على الحلقات نفسها -- ستُزال فقط من هذه المجموعة.
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
