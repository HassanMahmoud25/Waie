import { Skeleton } from "@/components/ui/skeleton";

export default function EpisodeLoading() {
  return (
    <main>
      <section className="container pt-7 md:pt-12">
        <Skeleton className="h-4 w-56" />

        <div className="mt-7 grid gap-8 lg:grid-cols-[1.25fr_.75fr]">
          <div>
            <Skeleton className="h-3 w-32" />
            <Skeleton className="mt-4 h-12 w-full max-w-2xl" />
            <Skeleton className="mt-3 h-12 w-2/3 max-w-lg" />
            <Skeleton className="mt-5 h-4 w-64" />
          </div>
          <div className="flex flex-wrap items-end gap-2 lg:justify-end">
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <div className="mt-9">
          <Skeleton className="aspect-video w-full rounded-[var(--radius-banner)]" />
        </div>
      </section>

      <section className="container section">
        <div className="grid gap-6 lg:grid-cols-[1fr_.42fr]">
          <div>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-4 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-5/6" />
            <div className="mt-8 flex flex-wrap gap-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
          <Skeleton className="h-40 w-full" />
        </div>
      </section>

      <section className="section-tint pb-14 md:pb-20">
        <div className="container">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-8 w-56" />
          <div className="mt-8">
            <Skeleton className="h-11 w-full max-w-md" />
            <Skeleton className="mt-6 h-64 w-full" />
          </div>
        </div>
      </section>
    </main>
  );
}
