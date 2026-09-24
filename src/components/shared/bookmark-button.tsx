"use client";

import { useRouter } from "next/navigation";
import { Bookmark, Loader2 } from "lucide-react";
import { useLibrary } from "@/hooks/use-library";
import { IconButton } from "@/components/ui/icon-button";

/**
 * Saves/unsaves an episode for the signed-in account (see
 * lib/library/actions.ts) -- server-rendered from the real session via
 * SavedEpisodesProvider, so it's correct on first paint, no hydration
 * flash. Signed-out visitors are sent to sign in rather than saving locally.
 *
 * The toggle stays optimistic (the icon flips immediately), but while the
 * Server Action is in flight the icon becomes a spinner and the button is
 * disabled against a second overlapping click; if the action actually fails,
 * SavedEpisodesProvider already reverts the icon -- this only adds the
 * user-facing message explaining why, using the action's own safe error
 * string (never a raw server/DB error).
 */
export function BookmarkButton({ episodeId }: { episodeId: string }) {
  const router = useRouter();
  const { isAuthenticated, isSaved, toggleSaved, isSaving, saveError } = useLibrary();
  const saved = isSaved(episodeId);

  return (
    <div className="flex flex-col items-end gap-1.5">
      <IconButton
        aria-label={saved ? "إزالة من المحفوظات" : "حفظ الحلقة"}
        pressed={saved}
        aria-busy={isSaving}
        disabled={isSaving}
        onClick={() => {
          if (!isAuthenticated) {
            router.push("/login");
            return;
          }
          toggleSaved(episodeId);
        }}
      >
        {isSaving ? (
          <Loader2 size={18} className="animate-spin" aria-hidden="true" />
        ) : (
          <Bookmark size={18} fill={saved ? "currentColor" : "none"} aria-hidden="true" />
        )}
      </IconButton>
      {saveError && (
        <p role="alert" className="max-w-[12rem] text-xs font-bold leading-5 text-[#8c2b20]">
          {saveError}
        </p>
      )}
    </div>
  );
}
