import type { Transcript } from "@/types/transcript";
import { EmptyState } from "@/components/content/empty-state";

/**
 * The "النص الكامل" tab: a real reading experience (Naskh serif, generous
 * line-height), not a text dump. Renders the single transcript body as
 * paragraphs split on blank lines -- there is no per-segment structure, no
 * timestamps and no speakers to render (Phase 5H: a transcript is one plain
 * text body, not a list of timestamped segments).
 */
export function TranscriptReader({ transcript }: { transcript: Transcript | null }) {
  if (!transcript || transcript.text.trim() === "") {
    return <EmptyState title="النص الكامل لهذه الحلقة غير متاح بعد." />;
  }

  const paragraphs = transcript.text.trim().split(/\n{2,}/);

  return (
    <div className="font-reading mx-auto max-w-2xl space-y-7 text-lg leading-[2.1] text-[var(--ink)]">
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="whitespace-pre-line">
          {paragraph}
        </p>
      ))}
    </div>
  );
}
