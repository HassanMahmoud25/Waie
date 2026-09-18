"use client";

import { Bookmark } from "lucide-react";
import { useLibrary } from "@/hooks/use-library";
import { IconButton } from "@/components/ui/icon-button";

/** Saves/unsaves an episode to the local library (see hooks/use-library.ts). */
export function BookmarkButton({ episodeId }: { episodeId: string }) {
  const { isHydrated, isSaved, toggleSaved } = useLibrary();
  const saved = isHydrated && isSaved(episodeId);

  return (
    <IconButton
      aria-label={saved ? "إزالة من المحفوظات" : "حفظ الحلقة"}
      pressed={saved}
      onClick={() => toggleSaved(episodeId)}
    >
      <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
    </IconButton>
  );
}
