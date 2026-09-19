"use client";

import type { KeyboardEvent } from "react";
import { Clapperboard, Headphones } from "lucide-react";
import type { MediaMode } from "@/lib/playback/item";
import { cn } from "@/lib/utils/cn";

const options = [
  { mode: "video", label: "مشاهدة", Icon: Clapperboard },
  { mode: "audio", label: "استماع", Icon: Headphones },
] as const;

/**
 * "Watch | Listen": the one control for choosing how to take in an episode.
 * A black pill glides between the two ends (the same black-active language as
 * the header nav and mobile tab bar), with the active icon picked out in the
 * brand gold. Built as a radio group, so it's one tab stop and the arrow keys
 * move between the two -- the same recording either way, which is why it's a
 * choice and not navigation.
 */
export function MediaModeSwitch({
  mode,
  audioAvailable,
  onChange,
  className,
}: {
  mode: MediaMode;
  /** false until Waie has an audio file for the episode: the option stays visible (so the feature is discoverable) but can't be chosen. */
  audioAvailable: boolean;
  onChange: (mode: MediaMode) => void;
  className?: string;
}) {
  const choose = (next: MediaMode) => {
    if (next === "audio" && !audioAvailable) return;
    if (next !== mode) onChange(next);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    // Two options: any arrow goes to the other one.
    const next: MediaMode = mode === "video" ? "audio" : "video";
    if (next === "audio" && !audioAvailable) return;
    choose(next);
    event.currentTarget.parentElement?.querySelector<HTMLButtonElement>(`[data-mode="${next}"]`)?.focus();
  };

  return (
    <div className={cn("mode-switch", className)} role="radiogroup" aria-label="طريقة متابعة الحلقة" data-active={mode}>
      <span className="mode-switch__thumb" aria-hidden="true" />
      {options.map(({ mode: optionMode, label, Icon }) => {
        const disabled = optionMode === "audio" && !audioAvailable;
        return (
          <button
            key={optionMode}
            type="button"
            role="radio"
            data-mode={optionMode}
            aria-checked={mode === optionMode}
            aria-disabled={disabled || undefined}
            aria-describedby={disabled ? "mode-switch-hint" : undefined}
            tabIndex={mode === optionMode ? 0 : -1}
            className="mode-switch__option"
            onClick={() => choose(optionMode)}
            onKeyDown={handleKeyDown}
          >
            <Icon size={17} aria-hidden="true" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
