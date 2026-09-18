import { Skeleton } from "@/components/ui/skeleton";

export default function CollectionsLoading() {
  return (
    <main className="container py-14">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-9 w-48" />
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-40 w-full" />
        ))}
      </div>
    </main>
  );
}
