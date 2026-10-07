import {
  AdminCreateFormSkeleton,
  AdminHeaderSkeleton,
  AdminListSkeleton,
  AdminSearchFieldSkeleton,
  AdminTabsSkeleton,
} from "@/components/admin/admin-skeletons";

/** Mirrors app/admin/episodes/page.tsx: header, create form, search box, status tabs, thumbnail rows. */
export default function AdminEpisodesLoading() {
  return (
    <div>
      <AdminHeaderSkeleton withBack description={[2, 1, 1]} />

      <div className="mt-8 md:mt-10">
        <AdminCreateFormSkeleton buttonWidth="sm:w-[141px]" />
        <div className="mt-6">
          <AdminSearchFieldSkeleton />
        </div>
        <AdminTabsSkeleton className="mt-4" />
        <div className="mt-4">
          <AdminListSkeleton count={6} thumbnail statusBadge />
        </div>
      </div>
    </div>
  );
}
