import {
  AdminDeletePanelSkeleton,
  AdminFieldSkeleton,
  AdminFormFooterSkeleton,
  AdminHeaderSkeleton,
  AdminIdentityCardSkeleton,
} from "@/components/admin/admin-skeletons";

/**
 * Mirrors app/admin/topics/[id]/page.tsx + TopicEditor: identity card (with
 * the public-page link), the content form (title, description, color + hint,
 * SEO pair, footer) and the delete panel. Without this the list's loading
 * state (topics/loading.tsx) was the nearest boundary for the editor.
 */
export default function AdminTopicEditorLoading() {
  return (
    <div>
      <AdminHeaderSkeleton withBack />

      <div className="mt-8 grid gap-6 md:mt-10">
        <AdminIdentityCardSkeleton withAction metaItems={5} />

        <div className="admin-panel grid gap-6 p-5 sm:p-8">
          <AdminFieldSkeleton labelWidth="w-16" />
          <AdminFieldSkeleton labelWidth="w-12" fieldHeight="h-[120px]" />
          <div className="sm:max-w-xs">
            <AdminFieldSkeleton labelWidth="w-12" hint={1} />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <AdminFieldSkeleton labelWidth="w-32" />
            <AdminFieldSkeleton labelWidth="w-32" />
          </div>
          <AdminFormFooterSkeleton />
        </div>

        <AdminDeletePanelSkeleton note={[2, 1, 1]} />
      </div>
    </div>
  );
}
