/**
 * Arabic-first formatting helpers shared across the content layer and UI.
 * Kept framework-free so they can be unit tested and reused from Server
 * and Client Components alike.
 */

/** Formats a duration given in seconds as a short Arabic string, e.g. "1 س 14 د" or "56 د". */
export function formatDuration(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.round((safeSeconds % 3600) / 60);

  if (hours > 0) {
    return minutes > 0 ? `${hours} س ${minutes} د` : `${hours} س`;
  }

  return `${minutes} د`;
}

/** Formats a duration as HH:MM:SS or MM:SS for timestamps (transcript, recommendations, player). */
export function formatTimestamp(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  const pad = (value: number) => value.toString().padStart(2, "0");

  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`;
}

/** Parses a "MM:SS", "H:MM:SS", or plain-seconds string (the inverse of formatTimestamp) back into seconds. Returns null when the input isn't a valid timestamp -- callers should fall back to the previous value rather than accept it. */
export function parseTimestamp(input: string): number | null {
  const parts = input.trim().split(":").map((part) => part.trim());
  if (parts.length === 0 || parts.length > 3 || parts.some((part) => !/^\d+$/.test(part))) return null;

  const numbers = parts.map(Number);
  if (numbers.length === 1) return numbers[0];

  // Last part is always seconds, the one before it minutes, and (if present) the first hours.
  const seconds = numbers[numbers.length - 1];
  const minutes = numbers[numbers.length - 2];
  const hours = numbers.length === 3 ? numbers[0] : 0;
  if (minutes >= 60 || seconds >= 60) return null;

  return hours * 3600 + minutes * 60 + seconds;
}

/** Formats a date as an Arabic month name with Western (Latin) digits, e.g. "19 يونيو 2026". */
export function formatArabicDate(date: Date): string {
  return new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** A short absolute date for compact metadata rows, e.g. "25 سبتمبر 2026". */
export function formatShortArabicDate(date: Date): string {
  return new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * "قبل" (ago) forms don't reuse `ArabicNounForms`/`formatCount` above: those
 * are built for a standalone count ("حلقة واحدة" = "one episode"), while an
 * "ago" phrase needs the bare noun after a number ("قبل 5 دقائق") and a
 * different, idiomatic one/two form ("قبل دقيقة", not "دقيقة واحدة قبل").
 */
type RelativeAgoForms = { one: string; two: string; few: string; many: string };

const MINUTE_AGO_FORMS: RelativeAgoForms = { one: "قبل دقيقة", two: "قبل دقيقتين", few: "دقائق", many: "دقيقة" };
const HOUR_AGO_FORMS: RelativeAgoForms = { one: "قبل ساعة", two: "قبل ساعتين", few: "ساعات", many: "ساعة" };
const DAY_AGO_FORMS: RelativeAgoForms = { one: "أمس", two: "قبل يومين", few: "أيام", many: "يومًا" };

function formatAgo(count: number, forms: RelativeAgoForms): string {
  if (count === 1) return forms.one;
  if (count === 2) return forms.two;
  const noun = count >= 3 && count <= 10 ? forms.few : forms.many;
  return `قبل ${count} ${noun}`;
}

/**
 * True relative time for recent activity ("الآن", "قبل 5 دقائق", "أمس"),
 * falling back to `formatShortArabicDate`'s absolute date past a week --
 * matching the common production convention of relative time for anything
 * recent enough to matter, absolute once it's just history. `now` is
 * injectable for tests; defaults to the real current time.
 */
export function formatRelativeArabicDate(date: Date, now: Date = new Date()): string {
  const diffSeconds = Math.max(0, Math.round((now.getTime() - date.getTime()) / 1000));

  if (diffSeconds < 45) return "الآن";

  const diffMinutes = Math.round(diffSeconds / 60);
  if (diffMinutes < 60) return formatAgo(diffMinutes, MINUTE_AGO_FORMS);

  const diffHours = Math.round(diffSeconds / 3600);
  if (diffHours < 24) return formatAgo(diffHours, HOUR_AGO_FORMS);

  const diffDays = Math.round(diffSeconds / 86400);
  if (diffDays < 7) return formatAgo(diffDays, DAY_AGO_FORMS);

  return formatShortArabicDate(date);
}

/** ISO 8601 duration for structured data (VideoObject.duration), e.g. "PT1H14M". */
export function toIso8601Duration(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  let result = "PT";
  if (hours > 0) result += `${hours}H`;
  if (minutes > 0) result += `${minutes}M`;
  if (seconds > 0 || (hours === 0 && minutes === 0)) result += `${seconds}S`;
  return result;
}

/** The four number-dependent forms of a noun in Arabic: 1, 2, 3-10, and 11+ (also used for the singular label next to a bare count). */
export type ArabicNounForms = { one: string; two: string; few: string; many: string };

export const EPISODE_FORMS: ArabicNounForms = { one: "حلقة واحدة", two: "حلقتان", few: "حلقات", many: "حلقة" };
export const SERIES_FORMS: ArabicNounForms = { one: "سلسلة واحدة", two: "سلسلتان", few: "سلاسل", many: "سلسلة" };
export const TOPIC_FORMS: ArabicNounForms = { one: "موضوع واحد", two: "موضوعان", few: "مواضيع", many: "موضوع" };
export const RESULT_FORMS: ArabicNounForms = { one: "نتيجة واحدة", two: "نتيجتان", few: "نتائج", many: "نتيجة" };

/** The noun alone, agreeing with `count` -- for layouts that render the number separately (e.g. "6" beside "سلاسل"). */
export function pluralNoun(count: number, forms: ArabicNounForms): string {
  return count === 0 || (count >= 3 && count <= 10) ? forms.few : forms.many;
}

/** Number plus noun in correct Arabic agreement: "حلقة واحدة"، "حلقتان"، "8 حلقات"، "22 حلقة". */
export function formatCount(count: number, forms: ArabicNounForms): string {
  if (count === 1) return forms.one;
  if (count === 2) return forms.two;
  return `${count} ${pluralNoun(count, forms)}`;
}
