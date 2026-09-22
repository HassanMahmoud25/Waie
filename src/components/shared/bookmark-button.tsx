"use client";

import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { useLibrary } from "@/hooks/use-library";
import { IconButton } from "@/components/ui/icon-button";

/**
 * Saves/unsaves an episode for the signed-in account (see
 * lib/library/actions.ts) -- server-rendered from the real session via
 * SavedEpisodesProvider, so it's correct on first paint, no hydration
 * flash. Signed-out visitors are sent to sign in rather than saving locally.
 */
export function BookmarkButton({ episodeId }: { episodeId: string }) {
  const router = useRouter();
  const { isAuthenticated, isSaved, toggleSaved } = useLibrary();
  const saved = isSaved(episodeId);

  return (
    <IconButton
      aria-label={saved ? "إزالة من المحفوظات" : "حفظ الحلقة"}
      pressed={saved}
      onClick={() => {
        if (!isAuthenticated) {
          router.push("/login");
          return;
        }
        toggleSaved(episodeId);
      }}
    >
      <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
    </IconButton>
  );
}
