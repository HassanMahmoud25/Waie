import { AdminCreateFormSkeleton, AdminHeaderSkeleton, AdminListSkeleton } from "@/components/admin/admin-skeletons";

/** Mirrors app/admin/people/page.tsx: header, the two-field create form, icon-tile rows -- Person has no status field. */
export default function AdminPeopleLoading() {
  return (
    <div>
      <AdminHeaderSkeleton withBack description={[2, 1, 1]} />

      <div className="mt-8 md:mt-10">
        <AdminCreateFormSkeleton fields={2} buttonWidth="sm:w-[97px]" />
        <div className="mt-6">
          <AdminListSkeleton count={6} thumbnail={false} statusBadge={false} />
        </div>
      </div>
    </div>
  );
}
