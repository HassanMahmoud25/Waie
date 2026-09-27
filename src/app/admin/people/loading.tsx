import { AdminCreateFormSkeleton, AdminHeaderSkeleton, AdminListSkeleton } from "@/components/admin/admin-skeletons";

/** Mirrors app/admin/topics/loading.tsx: header, create form, icon-tile rows -- Person has no status field. */
export default function AdminPeopleLoading() {
  return (
    <div>
      <AdminHeaderSkeleton withBack />

      <div className="mt-8 md:mt-10">
        <AdminCreateFormSkeleton />
        <div className="mt-6">
          <AdminListSkeleton count={6} thumbnail={false} statusBadge={false} />
        </div>
      </div>
    </div>
  );
}
