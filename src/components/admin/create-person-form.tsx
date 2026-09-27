"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPersonAction } from "@/lib/admin/content/person-actions";

/** Creates a new Person from a name and optional image URL, then navigates to its editor. Mirrors create-topic-form.tsx. */
export function CreatePersonForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createPersonAction({ name, imageUrl });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/admin/people/${result.data.id}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="admin-panel admin-panel--dashed flex flex-col gap-3 p-5 sm:flex-row sm:items-start">
      <div className="grid flex-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="personName" className="admin-label">
            إضافة شخص جديد
          </label>
          <input
            id="personName"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="مثال: مصطفى خالد"
            className="admin-field"
            required
          />
        </div>
        <div>
          <label htmlFor="personImageUrl" className="admin-label">
            رابط الصورة (اختياري)
          </label>
          <input
            id="personImageUrl"
            name="imageUrl"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            dir="ltr"
            inputMode="url"
            placeholder="https://... أو /people/..."
            className="admin-field"
          />
        </div>
        {error && (
          <p role="alert" className="admin-notice admin-notice--danger font-bold sm:col-span-2">
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
        {isPending ? "جارٍ الإنشاء…" : "إنشاء"}
      </Button>
    </form>
  );
}
