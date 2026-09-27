"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type PickablePerson = { id: string; name: string; imageUrl?: string | null };

/**
 * Ordered chip picker for an episode's participants -- reads/writes plain
 * `personId[]` (selection order === EpisodeParticipant.position, see
 * updateEpisodeContent). Deliberately not a native `<select multiple>`
 * (episode-editor.tsx's topicIds field): that control has no concept of
 * selection order, only DOM order, which would silently break ordering.
 * No drag-and-drop reordering -- selection order is enough (removing and
 * re-adding a person moves them to the end, which is an acceptable way to
 * reorder for a list this small).
 */
export function ParticipantPicker({
  people,
  value,
  onChange,
}: {
  people: PickablePerson[];
  value: string[];
  onChange: (ids: string[]) => void;
}) {
  const byId = new Map(people.map((person) => [person.id, person]));
  const selected = value.map((id) => byId.get(id)).filter((person): person is PickablePerson => Boolean(person));
  const available = people.filter((person) => !value.includes(person.id));

  function remove(id: string) {
    onChange(value.filter((existing) => existing !== id));
  }

  function add(id: string) {
    if (!id || value.includes(id)) return;
    onChange([...value, id]);
  }

  return (
    <div>
      <div className={cn("flex flex-wrap items-center gap-2", selected.length > 0 && "mb-3")}>
        {selected.map((person) => (
          <span
            key={person.id}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--paper)] py-1.5 pe-1.5 ps-3 text-sm font-bold shadow-[var(--shadow-sm)]"
          >
            {person.name}
            <button
              type="button"
              onClick={() => remove(person.id)}
              aria-label={`إزالة ${person.name}`}
              className="grid size-6 place-items-center rounded-full text-[var(--ink-soft)] transition-colors hover:bg-[var(--line-soft)] hover:text-[var(--ink)]"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </span>
        ))}
      </div>

      {available.length > 0 ? (
        <select
          value=""
          onChange={(e) => add(e.target.value)}
          className="admin-field w-auto"
          aria-label="إضافة شخص كمشارك"
        >
          <option value="">+ إضافة شخص</option>
          {available.map((person) => (
            <option value={person.id} key={person.id}>
              {person.name}
            </option>
          ))}
        </select>
      ) : (
        selected.length === 0 && (
          <p className="text-sm leading-7 text-[var(--ink-soft)]">
            لا يوجد أشخاص بعد -- أضف شخصًا من صفحة الأشخاص أولًا.
          </p>
        )
      )}
    </div>
  );
}
