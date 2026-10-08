import { Skeleton } from "@/components/ui/skeleton";
import {
  AdminButtonSkeleton,
  AdminFieldSkeleton,
  AdminHeaderSkeleton,
  AdminPanelHeadSkeleton,
  SkeletonLine,
  SkeletonLines,
} from "@/components/admin/admin-skeletons";

/**
 * Mirrors app/admin/account/page.tsx: header, then the account-details panel
 * (three icon + label/value rows) beside the change-password panel (heading +
 * note, three password fields -- the second with its policy hint -- and the
 * forgot-link / submit footer). Without this, the overview's loading state
 * (app/admin/loading.tsx) was the nearest boundary and flashed stat tiles and
 * an episode list in front of this form.
 */
export default function AdminAccountLoading() {
  return (
    <div>
      <AdminHeaderSkeleton withBack />

      <div className="mt-8 grid gap-6 md:mt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-start">
        <div className="admin-panel">
          <AdminPanelHeadSkeleton titleWidth="w-14" />
          <div className="flex flex-col gap-4 p-4 sm:p-5">
            {["w-16", "w-40", "w-12"].map((valueWidth, index) => (
              <div className="flex items-center gap-3" key={index}>
                <Skeleton className="size-11 shrink-0 rounded-[14px]" />
                <div className="min-w-0 flex-1">
                  <SkeletonLine box="h-5" bar="h-3 w-24" />
                  <SkeletonLine box="h-6" bar={`h-4 max-w-full ${valueWidth}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-panel__head flex-col items-start gap-1">
            <SkeletonLine box="h-[25px]" bar="h-4 w-32" />
            <div className="w-full">
              <SkeletonLines lines={[2, 1, 2, 2]} box="h-7" bar="h-3" />
            </div>
          </div>
          <div className="flex flex-col gap-5 p-4 sm:p-5">
            <AdminFieldSkeleton labelWidth="w-32" />
            <AdminFieldSkeleton labelWidth="w-32" hint={1} hintLine="h-5" />
            <AdminFieldSkeleton labelWidth="w-40" />
            <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
              <SkeletonLine box="h-5 justify-center sm:justify-start" bar="h-3 w-36" />
              <AdminButtonSkeleton className="w-full sm:w-[157px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
