"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createEpisodeAction } from "@/lib/admin/content/actions";

/**
 * Creates a new DRAFT episode from a pasted YouTube URL/id, then navigates
 * straight to its editor. Calls createEpisodeAction directly (it's a Server
 * Action, importable and callable from a Client Component like a normal
 * async function) -- no form/useActionState wrapper, since the manual
 * pending/error state below is simpler for a single-field, navigate-on-success
 * flow than shoehorning it into useActionState's (prevState, formData) shape.
 */
export function CreateEpisodeForm() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createEpisodeAction(value);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/admin/episodes/${result.data.id}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="admin-panel admin-panel--dashed flex flex-col gap-3 p-5 sm:flex-row sm:items-start">
      <div className="flex-1">
        <label htmlFor="youtubeUrlOrId" className="admin-label">
          إضافة حلقة جديدة
        </label>
        <input
          id="youtubeUrlOrId"
          name="youtubeUrlOrId"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          dir="ltr"
          placeholder="https://www.youtube.com/watch?v=… أو معرّف الفيديو"
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
        {isPending ? "جارٍ الجلب…" : "إنشاء مسودة"}
      </Button>
    </form>
  );
}
