import { MapPin } from "lucide-react";
import { formatTimestamp } from "@/lib/utils/format";

/**
 * A note's timestamp, rendered as a small accent-colored landmark pin rather
 * than plain text -- the visual anchor tying a note to a specific moment,
 * consistent with the pin/marker language used elsewhere on the episode page.
 */
export function NoteTimestamp({ seconds, onClick }: { seconds: number; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="note-timestamp">
      <MapPin size={13} aria-hidden="true" />
      {formatTimestamp(seconds)}
    </button>
  );
}
