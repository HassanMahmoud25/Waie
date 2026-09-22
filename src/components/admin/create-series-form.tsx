"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSeriesAction } from "@/lib/admin/content/series-actions";

/**
 * Creates a new DRAFT series from just a title, then navigates straight to
 * its editor -- everything else (slug, other fields) is filled in there.
 * Mirrors create-episode-form.tsx's manual useState/useTransition pattern
 * (no useActionState: createSeriesAction's (title) signature doesn't match
 * useActionState's (prevState, formData) shape).
 */
export function CreateSeriesForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createSeriesAction(title);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/admin/series/${result.data.id}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="admin-panel admin-panel--dashed flex flex-col gap-3 p-5 sm:flex-row sm:items-start">
      <div className="flex-1">
        <label htmlFor="seriesTitle" className="admin-label">
          إضافة سلسلة جديدة
        </label>
        <input
          id="seriesTitle"
          name="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="مثال: سلسلة الصحابة"
          className="admin-field"
          required
        />
        {error && (
          <p role="alert" className="admin-notice admin-notice--danger mt-3 font-bold">
            <CircleAlert size={17} aria-hidden="true" />
            {error}
          </p>
        )}
      </div>
      <Button
        type="submit"
        disabled={isPending}
        aria-busy={isPending}
        icon={isPending ? <Loader2 className="animate-spin" size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
        iconPosition="start"
        className="sm:mt-[1.85rem]"
      >
        {isPending ? "جارٍ الإنشاء…" : "إنشاء مسودة"}
      </Button>
    </form>
  );
}
