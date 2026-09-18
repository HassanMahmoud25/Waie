"use client";

import { Check } from "lucide-react";
import { useLibrary } from "@/hooks/use-library";
import { cn } from "@/lib/utils/cn";

export function MarkWatchedButton({ episodeId }: { episodeId: string }) {
  const { isHydrated, getProgress, toggleCompleted } = useLibrary();
  const completed = isHydrated && Boolean(getProgress(episodeId)?.completed);

  return (
    <button
      type="button"
      className={cn("btn", completed ? "btn-watched" : "btn-secondary")}
      aria-pressed={completed}
      onClick={() => toggleCompleted(episodeId)}
    >
      {completed && <Check size={16} />}
      {completed ? "تمّت المشاهدة" : "تمّت المشاهدة؟"}
    </button>
  );
}
