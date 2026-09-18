import type { Metadata } from "next";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "الصفحة غير موجودة" };

export default function NotFound() {
  return (
    <>
      <main className="container py-24 text-center h-screen flex flex-col justify-center align-center">
        <p className="eyebrow-pill mx-auto w-fit">٤٠٤</p>
        <h1 className="mt-4 text-3xl font-black leading-[1.2] tracking-[-.03em] md:text-4xl">لم نجد هذه الصفحة</h1>
        <p className="mx-auto mt-4 max-w-md leading-7 text-[var(--ink-soft)]">
          ربما تغيّر الرابط أو حُذفت الحلقة. جرّب البحث أو عُد إلى الرئيسية.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/">الرئيسية</Button>
          <Button href="/search" variant="secondary">
            ابحث في وعي
          </Button>
        </div>
      </main>
    </>
  );
}
