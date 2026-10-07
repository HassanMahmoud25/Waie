import {
  AdminDeletePanelSkeleton,
  AdminFieldSkeleton,
  AdminFormFooterSkeleton,
  AdminHeaderSkeleton,
  AdminIdentityCardSkeleton,
} from "@/components/admin/admin-skeletons";

/**
 * Mirrors app/admin/people/[id]/page.tsx + PersonEditor: identity card, the
 * content form (name, image URL + its hint, footer) and the delete
 * panel. Without this the list's loading state (people/loading.tsx) was the
 * nearest boundary for the editor.
 */
export default function AdminPersonEditorLoading() {
  return (
    <div>
      <AdminHeaderSkeleton withBack />

      <div className="mt-8 grid gap-6 md:mt-10">
        <AdminIdentityCardSkeleton />

        <div className="admin-panel grid gap-6 p-5 sm:p-8">
          <AdminFieldSkeleton labelWidth="w-12" />
          <AdminFieldSkeleton labelWidth="w-32" hint={[3, 1, 1]} />
          <AdminFormFooterSkeleton />
        </div>

        <AdminDeletePanelSkeleton />
      </div>
    </div>
  );
}
