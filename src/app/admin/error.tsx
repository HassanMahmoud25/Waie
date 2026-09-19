"use client";

import { CircleAlert, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Route-level failure (e.g. the database is unreachable): the frame survives, the content column explains and offers a retry. */
export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="admin-panel mx-auto mt-6 max-w-xl px-6 py-12 text-center">
      <span className="admin-tile admin-tile--gold mx-auto">
        <CircleAlert size={22} aria-hidden="true" />
      </span>
      <h1 className="mt-4 text-xl font-black">تعذّر تحميل هذه الصفحة</h1>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-[var(--ink-soft)]">
        حدث خطأ أثناء جلب البيانات. تأكد من اتصال قاعدة البيانات ثم حاول مرة أخرى.
      </p>
      <Button className="mt-6" variant="secondary" onClick={reset} icon={<RotateCw size={16} aria-hidden="true" />} iconPosition="start">
        إعادة المحاولة
      </Button>
    </div>
  );
}
