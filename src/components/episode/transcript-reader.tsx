import type { Transcript } from "@/types/transcript";
import { TimestampButton } from "./timestamp-button";
import { EmptyState } from "@/components/content/empty-state";

/** The "النص الكامل" tab: a real reading experience (Naskh serif, generous line-height), not a text dump. */
export function TranscriptReader({ transcript }: { transcript: Transcript | null }) {
  if (!transcript || transcript.segments.length === 0) {
    return <EmptyState title="النص الكامل للحلقة غير متاح حاليًا." />;
  }

  return (
    <div className="font-reading mx-auto max-w-2xl space-y-7 text-lg leading-[2.1] text-[var(--ink)]">
      {transcript.segments.map((segment) => (
        <p key={segment.id} className="flex flex-col gap-2 sm:flex-row sm:gap-5">
          <span className="shrink-0 sm:w-14 sm:pt-1">
            <TimestampButton seconds={segment.startSeconds} />
          </span>
          <span>{segment.text}</span>
        </p>
      ))}
    </div>
  );
}
