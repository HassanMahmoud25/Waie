"use client";

import { useEffect, useRef, useState } from "react";
import { Locate, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTimestamp, parseTimestamp } from "@/lib/utils/format";

/**
 * Shared inline form for both adding and editing a note -- a compact card,
 * not a modal, so writing a note never interrupts the surrounding page.
 */
export function NoteComposer({
  mode,
  initialSeconds,
  initialText = "",
  durationSeconds,
  getCurrentTime,
  onSave,
  onCancel,
}: {
  mode: "add" | "edit";
  initialSeconds: number;
  initialText?: string;
  durationSeconds: number;
  getCurrentTime: () => number;
  onSave: (seconds: number, text: string) => void;
  onCancel: () => void;
}) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [text, setText] = useState(initialText);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [timeDraft, setTimeDraft] = useState("");
  const timeInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    if (isEditingTime) {
      timeInputRef.current?.focus();
      timeInputRef.current?.select();
    }
  }, [isEditingTime]);

  const clamp = (value: number) =>
    Math.max(0, durationSeconds > 0 ? Math.min(value, Math.round(durationSeconds)) : value);

  const openTimeEditor = () => {
    setTimeDraft(formatTimestamp(seconds));
    setIsEditingTime(true);
  };

  const commitTimeDraft = () => {
    const parsed = parseTimestamp(timeDraft);
    if (parsed !== null) setSeconds(clamp(parsed));
    setIsEditingTime(false);
  };

  const handleSave = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSave(seconds, trimmed);
  };

  return (
    <div className="note-composer">
      <div className="flex flex-wrap items-center gap-2">
        {isEditingTime ? (
          <input
            ref={timeInputRef}
            type="text"
            inputMode="numeric"
            value={timeDraft}
            onChange={(event) => setTimeDraft(event.target.value)}
            onBlur={commitTimeDraft}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commitTimeDraft();
              }
              if (event.key === "Escape") {
                event.preventDefault();
                setIsEditingTime(false);
              }
            }}
            className="note-timestamp-input"
            aria-label="توقيت الملاحظة"
          />
        ) : (
          <button type="button" onClick={openTimeEditor} className="note-timestamp" aria-label="تعديل توقيت الملاحظة">
            <MapPin size={13} aria-hidden="true" />
            {formatTimestamp(seconds)}
          </button>
        )}
        {mode === "add" && (
          <button
            type="button"
            onClick={() => setSeconds(clamp(getCurrentTime()))}
            className="note-composer__now"
          >
            <Locate size={13} aria-hidden="true" />
            التقط الوقت الحالي
          </button>
        )}
      </div>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="اكتب ملاحظتك هنا..."
        rows={3}
        className="note-composer__textarea"
      />
      <div className="mt-3 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="button" variant="secondary" onClick={handleSave} disabled={!text.trim()}>
          {mode === "edit" ? "حفظ التعديلات" : "حفظ الملاحظة"}
        </Button>
      </div>
    </div>
  );
}
