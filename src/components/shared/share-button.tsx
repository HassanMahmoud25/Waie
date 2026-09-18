"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";

/** Uses the Web Share API when available, otherwise copies the link and confirms briefly. */
export function ShareButton({ title, url }: { title: string; url: string }) {
  const [justCopied, setJustCopied] = useState(false);

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // User cancelled the native share sheet — fall through silently.
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 2000);
    } catch {
      // Clipboard unavailable — nothing more we can do without a full UI.
    }
  };

  return (
    <IconButton aria-label={justCopied ? "تم نسخ الرابط" : "مشاركة"} onClick={handleShare}>
      {justCopied ? <Check size={18} /> : <Share2 size={18} />}
    </IconButton>
  );
}
