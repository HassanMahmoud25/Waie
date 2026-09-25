import { AdminCreateFormSkeleton, AdminHeaderSkeleton, AdminListSkeleton, AdminTabsSkeleton } from "@/components/admin/admin-skeletons";

/** Mirrors app/admin/collections/page.tsx: header, create form, status tabs, icon-tile rows. */
export default function AdminCollectionsLoading() {
  return (
    <div>
      <AdminHeaderSkeleton withBack />

      <div className="mt-8 md:mt-10">
        <AdminCreateFormSkeleton />
        <AdminTabsSkeleton />
        <div className="mt-4">
          <AdminListSkeleton count={6} thumbnail={false} statusBadge />
        </div>
      </div>
    </div>
  );
}
