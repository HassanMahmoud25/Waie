import {
  AdminDeletePanelSkeleton,
  AdminFieldSkeleton,
  AdminFormFooterSkeleton,
  AdminHeaderSkeleton,
  AdminIdentityCardSkeleton,
  AdminPublishCardSkeleton,
} from "@/components/admin/admin-skeletons";

/**
 * Mirrors app/admin/series/[id]/page.tsx + SeriesEditor: publish card,
 * identity card (with the public-page link a published series shows), the
 * content form (title, description, topic select, cover pair, SEO pair,
 * footer) and the delete panel. Without this the list's loading state
 * (series/loading.tsx) was the nearest boundary for the editor.
 */
export default function AdminSeriesEditorLoading() {
  return (
    <div>
      <AdminHeaderSkeleton withBack />

      <div className="mt-8 grid gap-6 md:mt-10">
        <AdminPublishCardSkeleton />
        <AdminIdentityCardSkeleton withAction metaItems={4} />

        <div className="admin-panel grid gap-6 p-5 sm:p-8">
          <AdminFieldSkeleton labelWidth="w-16" />
          <AdminFieldSkeleton labelWidth="w-12" fieldHeight="h-[148px]" />
          <AdminFieldSkeleton labelWidth="w-28" fieldWidth="sm:max-w-xs" />
          <div className="grid gap-6 sm:grid-cols-2">
            <AdminFieldSkeleton labelWidth="w-24" />
            <AdminFieldSkeleton labelWidth="w-32" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <AdminFieldSkeleton labelWidth="w-32" />
            <AdminFieldSkeleton labelWidth="w-32" />
          </div>
          <AdminFormFooterSkeleton />
        </div>

        <AdminDeletePanelSkeleton />
      </div>
    </div>
  );
}
