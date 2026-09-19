"use client";

import { useActionState } from "react";
import { CircleAlert, Loader2 } from "lucide-react";
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
    <form action={formAction} className="admin-panel grid gap-6 p-5 sm:p-8">
      <div>
        <label htmlFor="title" className="admin-label">
          العنوان
        </label>
        <input id="title" name="title" defaultValue={episode.title} required className="admin-field" />
      </div>

      <div>
        <label htmlFor="description" className="admin-label">
          الوصف
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={episode.description}
          required
          rows={5}
          className="admin-field"
        />
      </div>

      <div className="sm:max-w-xs">
        <label htmlFor="status" className="admin-label">
          الحالة
        </label>
        <select id="status" name="status" defaultValue={episode.status} className="admin-field">
          {statusOptions.map((option) => (
            <option value={option.value} key={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="audioUrl" className="admin-label">
          رابط النسخة الصوتية
        </label>
        <input
          id="audioUrl"
          name="audioUrl"
          type="url"
          dir="ltr"
          inputMode="url"
          defaultValue={episode.audioUrl ?? ""}
          placeholder="https://media.example.com/episodes/waie-111.m4a"
          aria-describedby="audioUrl-hint"
          className="admin-field"
        />
        <p id="audioUrl-hint" className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
          اختياري. يُستخدم تلقائيًا صوت الحلقة من بودكاست وعي عند توفره؛ هذا الحقل لتجاوزه أو لحلقة غير موجودة في البودكاست (ملف صوتي تملكه وعي، مثل M4A). اتركه فارغًا للاعتماد على البودكاست. لا تُقبل روابط يوتيوب.
        </p>
      </div>

      {state.error && (
        <p role="alert" className="admin-notice admin-notice--danger font-bold">
          <CircleAlert size={17} aria-hidden="true" />
          {state.error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-[var(--line-soft)] pt-6 sm:flex-row sm:items-center">
        <Button
          type="submit"
          disabled={isPending}
          aria-busy={isPending}
          icon={isPending ? <Loader2 className="animate-spin" size={16} aria-hidden="true" /> : undefined}
          iconPosition="start"
        >
          {isPending ? "جارٍ الحفظ…" : "حفظ التعديلات"}
        </Button>
        <Button href="/admin/episodes" variant="secondary">
          إلغاء
        </Button>
      </div>
    </form>
  );
}
