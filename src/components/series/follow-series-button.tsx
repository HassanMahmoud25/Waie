"use client";

import { useRouter } from "next/navigation";
import { Check, Loader2, Plus } from "lucide-react";
import { useFollowedSeriesContext } from "@/components/library/followed-series-provider";
import { cn } from "@/lib/utils/cn";

/**
 * Follow/unfollow CTA for the Series hero banner -- server-rendered from the
 * real session via FollowedSeriesProvider, so it's correct on first paint,
 * no hydration flash. Mirrors BookmarkButton's interaction model (optimistic
 * toggle, spinner while the Server Action is in flight, signed-out visitors
 * routed to /login instead of a silent no-op) but uses the on-media button
 * treatment since it sits directly over the hero photo, not a glass card.
 */
export function FollowSeriesButton({ seriesId, className }: { seriesId: string; className?: string }) {
  const router = useRouter();
  const { isAuthenticated, isFollowed, toggleFollowed, isToggling, followError } = useFollowedSeriesContext();
  const following = isAuthenticated && isFollowed(seriesId);

  return (
    <div className="flex flex-col items-start gap-1.5">
      <button
        type="button"
        className={cn("btn", following ? "btn-on-media--outline" : "btn-on-media", className)}
        aria-pressed={following}
        aria-busy={isToggling}
        disabled={isToggling}
        onClick={() => {
          if (!isAuthenticated) {
            router.push("/login");
            return;
          }
          toggleFollowed(seriesId);
        }}
      >
        {isToggling ? (
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
        ) : following ? (
          <Check size={16} aria-hidden="true" />
        ) : (
          <Plus size={16} aria-hidden="true" />
        )}
        {following ? "متابِع" : "تابع السلسلة"}
      </button>
      {followError && (
        <p role="alert" className="glass-dark w-fit rounded-(--radius-pill) px-3 py-1.5 text-xs font-bold text-white">
          {followError}
        </p>
      )}
    </div>
  );
}
