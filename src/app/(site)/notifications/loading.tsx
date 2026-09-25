import { EyebrowPillSkeleton, SkeletonText, NotificationsPageSkeleton } from "@/components/content/loading-skeletons";

/** Mirrors /notifications: eyebrow + h1 (page.tsx has no intro paragraph), then the row list. */
export default function NotificationsLoading() {
  return (
    <main className="container py-14">
      <EyebrowPillSkeleton width="w-24" />
      <SkeletonText
        className="mt-4 text-2xl leading-[1.8] md:text-3xl"
        lines={["w-32"]}
        barHeight="h-[.6em]"
      />

      <div className="mt-8 max-w-xl">
        <NotificationsPageSkeleton />
      </div>
    </main>
  );
}
