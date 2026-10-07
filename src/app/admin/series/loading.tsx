import { AdminCreateFormSkeleton, AdminHeaderSkeleton, AdminListSkeleton, AdminTabsSkeleton } from "@/components/admin/admin-skeletons";

/** Mirrors app/admin/series/page.tsx: header, create form, status tabs, icon-tile rows. */
export default function AdminSeriesLoading() {
  return (
    <div>
      <AdminHeaderSkeleton withBack description={[2, 1, 1]} />

      <div className="mt-8 md:mt-10">
        <AdminCreateFormSkeleton buttonWidth="sm:w-[141px]" />
        <AdminTabsSkeleton className="mt-6" />
        <div className="mt-4">
          <AdminListSkeleton count={6} thumbnail={false} statusBadge />
        </div>
      </div>
    </div>
  );
}
