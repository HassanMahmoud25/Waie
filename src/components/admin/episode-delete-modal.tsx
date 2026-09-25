"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CircleAlert, Loader2, TriangleAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const TRANSITION_MS = 220;

/**
 * Confirms a permanent episode delete before it fires -- same portal/
 * backdrop/alertdialog plumbing as note-delete-modal.tsx (the one other
 * place this app uses a real modal instead of window.confirm for a delete),
 * sized up to explain the cascade's real scope: deleting an episode also
 * removes every user's notes/saves/watch-progress for it, not just the
 * episode row (see prisma/schema.prisma -- every Episode relation is ON
 * DELETE CASCADE).
 *
 * `isDeleting`/`error` are owned by the caller's useTransition, not local
 * state: the caller is the one actually calling deleteEpisodeAction, and on
 * success it navigates away immediately (no need for this modal to know).
 * While `isDeleting` is true, Cancel/close/Escape/backdrop are all disabled
 * so an in-flight, irreversible delete can't be interrupted or double-fired.
 */
export function EpisodeDeleteModal({
  episode,
  isDeleting,
  error,
  onCancel,
  onConfirm,
}: {
  episode: { id: string; title: string } | null;
  isDeleting: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const open = episode !== null;
  const [mounted, setMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  // Kept around locally so the title doesn't blank out mid-close-animation
  // once the caller clears its selection.
  const [displayedEpisode, setDisplayedEpisode] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (episode) setDisplayedEpisode(episode);
  }, [episode]);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      return;
    }
    const timeout = setTimeout(() => setShouldRender(false), TRANSITION_MS);
    return () => clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    if (!shouldRender) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [shouldRender]);

  function handleCancel() {
    if (isDeleting) return;
    onCancel();
  }

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isDeleting) onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, isDeleting, onCancel]);

  if (!mounted || !shouldRender || !displayedEpisode) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div
        className="note-modal-backdrop absolute inset-0 bg-[var(--cinematic)]/70 backdrop-blur-md"
        data-state={open ? "open" : "closed"}
        onClick={handleCancel}
        aria-hidden="true"
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-label="حذف الحلقة"
        data-state={open ? "open" : "closed"}
        className="note-modal-panel glass-strong relative z-10 w-full max-w-xl overflow-hidden rounded-[28px] shadow-[var(--shadow-lg)]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/50 px-5 py-4">
          <h2 className="text-base font-black">حذف هذه الحلقة؟</h2>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isDeleting}
            aria-label="إغلاق"
            className="icon-btn shrink-0 !size-9 disabled:opacity-40"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 sm:p-5">
          <div className="admin-notice admin-notice--warning font-bold">
            <TriangleAlert size={17} aria-hidden="true" />
            <span>{displayedEpisode.title}</span>
          </div>

          <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">
            سيُحذف هذا نهائيًا من موقع وعي: الحلقة نفسها، ونصّها وتوصياتها وخريطتها، بالإضافة إلى ملاحظات المستخدمين
            وحفظهم لها وتقدّمهم في مشاهدتها. لا يمكن التراجع عن هذا الإجراء.
          </p>

          {error && (
            <p role="alert" className="admin-notice admin-notice--danger mt-3 text-sm font-bold">
              <CircleAlert size={16} aria-hidden="true" />
              {error}
            </p>
          )}

          <div className="mt-5 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={handleCancel} disabled={isDeleting}>
              إلغاء
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={onConfirm}
              disabled={isDeleting}
              aria-busy={isDeleting}
              icon={isDeleting ? <Loader2 className="animate-spin" size={16} aria-hidden="true" /> : undefined}
              iconPosition="start"
            >
              {isDeleting ? "جارٍ الحذف…" : "حذف نهائي"}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
