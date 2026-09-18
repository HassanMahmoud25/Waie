"use client";

import { useActionState } from "react";
import type { Episode } from "@/types/episode";
import type { ContentStatus } from "@/types/content-status";
import { Button } from "@/components/ui/button";
import { updateEpisodeAction, type EpisodeEditState } from "@/app/admin/episodes/[id]/actions";

const statusOptions: { value: ContentStatus; label: string }[] = [
  { value: "PUBLISHED", label: "منشور" },
  { value: "DRAFT", label: "مسودة" },
  { value: "ARCHIVED", label: "مؤرشف" },
];

const initialState: EpisodeEditState = {};

export function EpisodeEditForm({ episode }: { episode: Episode }) {
  const [state, formAction, isPending] = useActionState(updateEpisodeAction.bind(null, episode.id), initialState);

  return (
    <form action={formAction} className="grid gap-6 border border-[var(--line)] bg-[var(--paper)] p-6">
      <div>
        <label htmlFor="title" className="block text-sm font-bold">
          العنوان
        </label>
        <input
          id="title"
          name="title"
          defaultValue={episode.title}
          required
          className="mt-2 w-full border border-[var(--line)] bg-white px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-bold">
          الوصف
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={episode.description}
          required
          rows={4}
          className="mt-2 w-full resize-y border border-[var(--line)] bg-white px-4 py-3 leading-7 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
        />
      </div>

      <div className="max-w-xs">
        <label htmlFor="status" className="block text-sm font-bold">
          الحالة
        </label>
        <select
          id="status"
          name="status"
          defaultValue={episode.status}
          className="mt-2 w-full border border-[var(--line)] bg-white px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
        >
          {statusOptions.map((option) => (
            <option value={option.value} key={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {state.error && (
        <p role="alert" className="border border-[var(--accent-strong)] bg-white px-4 py-3 text-sm font-bold text-[var(--accent-strong)]">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "جارٍ الحفظ…" : "حفظ التعديلات"}
        </Button>
        <Button href="/admin/episodes" variant="secondary">
          إلغاء
        </Button>
      </div>
    </form>
  );
}
