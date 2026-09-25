import { AdminCreateFormSkeleton, AdminHeaderSkeleton, AdminListSkeleton } from "@/components/admin/admin-skeletons";

/**
 * Mirrors app/admin/topics/page.tsx: header, create form, icon-tile rows --
 * no status tabs (Topic has no ContentStatus) and no status badge on each row.
 */
export default function AdminTopicsLoading() {
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
