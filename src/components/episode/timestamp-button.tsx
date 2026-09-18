"use client";

import { Play } from "lucide-react";
import { usePlayer } from "./player-context";
import { formatTimestamp } from "@/lib/utils/format";

/** Jumps the video to a specific moment — used by recommendations, transcript segments and mind-map nodes. */
export function TimestampButton({ seconds }: { seconds: number }) {
  const { seekTo } = usePlayer();

  return (
    <button
      type="button"
      onClick={() => seekTo(seconds)}
      className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-black transition-colors hover:text-black/65"
    >
      <Play size={12} fill="currentColor" />
      {formatTimestamp(seconds)}
    </button>
  );
}
