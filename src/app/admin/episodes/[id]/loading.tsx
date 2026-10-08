import { Skeleton } from "@/components/ui/skeleton";
import {
  AdminButtonSkeleton,
  AdminDeletePanelSkeleton,
  AdminFieldSkeleton,
  AdminFormFooterSkeleton,
  AdminHeaderSkeleton,
  AdminListSkeleton,
  AdminPublishCardSkeleton,
  SkeletonLine,
  SkeletonLines,
  type LineCounts,
} from "@/components/admin/admin-skeletons";

/**
 * Mirrors one of the episode page's sub-editor sections (TranscriptEditor /
 * MindMapEditor / RecommendationEditor) in their usual state -- no content
 * yet: heading + note, the EmptyState box, then the section's action(s).
 * `note` / `emptyNote` are line counts per width band (see LineCounts).
 */
function SubEditorSkeleton({
  note,
  emptyNote = 1,
  gap,
  footer = false,
}: {
  note: LineCounts;
  emptyNote?: LineCounts;
  gap: string;
  footer?: boolean;
}) {
  return (
    <div className={`admin-panel grid p-5 sm:p-8 ${gap}`}>
      <div>
        <SkeletonLine box="h-7" bar="h-5 w-32" />
        <div className="mt-1">
          <SkeletonLines lines={note} box="h-7" bar="h-3" />
        </div>
      </div>
      <div className="empty-state">
        <SkeletonLine box="h-6 justify-center" bar="h-4 w-48 max-w-full" />
        <div className="mt-1">
          <SkeletonLines lines={emptyNote} box="h-5 justify-center" bar="h-3 max-w-64" />
        </div>
      </div>
      <AdminButtonSkeleton className="w-36" />
      {footer && (
        <div className="border-t border-[var(--line-soft)] pt-6">
          <AdminButtonSkeleton className="w-32" />
        </div>
      )}
    </div>
  );
}

/**
 * Mirrors app/admin/episodes/[id]/page.tsx: compact header (most episode
 * titles are long enough for AdminShell's smaller heading), then
 * EpisodeEditor (publish card, YouTube-source row, the content form, delete
 * panel) and the transcript / mind-map / recommendations sections. Without
 * this the list's loading state (episodes/loading.tsx) was the nearest
 * boundary for the editor.
 */
export default function AdminEpisodeEditorLoading() {
  return (
    <div>
      <AdminHeaderSkeleton withBack compactTitle />

      <div className="mt-8 grid gap-6 md:mt-10">
        <div className="grid gap-6">
          <AdminPublishCardSkeleton />
          <AdminListSkeleton count={1} thumbnail statusBadge={false} />

          <div className="admin-panel grid gap-6 p-5 sm:p-8">
            <AdminFieldSkeleton labelWidth="w-16" />
            <AdminFieldSkeleton labelWidth="w-12" fieldHeight="h-[178px]" />
            <div className="grid gap-6 sm:grid-cols-2">
              <AdminFieldSkeleton labelWidth="w-16" />
              <AdminFieldSkeleton labelWidth="w-28" />
            </div>
            <AdminFieldSkeleton labelWidth="w-16" fieldHeight="h-[218px]" hint={[2, 1, 1]} />
            <div>
              <SkeletonLine box="h-[21px]" bar="h-3.5 w-32" />
              <Skeleton className="mt-2 h-[50px] w-36 rounded-[14px]" />
              <div className="mt-2">
                <SkeletonLines lines={[4, 2, 2]} box="h-7" bar="h-3" />
              </div>
            </div>
            <SkeletonLine box="h-6" bar="h-4 w-24" />
            <AdminFieldSkeleton labelWidth="w-36" hint={[5, 2, 3, 2]} />
            <div className="grid gap-6 sm:grid-cols-2">
              <AdminFieldSkeleton labelWidth="w-32" />
              <AdminFieldSkeleton labelWidth="w-32" />
            </div>
            <AdminFormFooterSkeleton extraButton />
          </div>

          <AdminDeletePanelSkeleton stackedBelow="xl" note={[3, 1, 1]} />
        </div>

        <SubEditorSkeleton note={[2, 1, 1]} gap="gap-5" />
        <SubEditorSkeleton note={[4, 2, 2]} emptyNote={[2, 1, 1]} gap="gap-6" />
        <SubEditorSkeleton note={[4, 2, 2]} gap="gap-6" footer />
      </div>
    </div>
  );
}
