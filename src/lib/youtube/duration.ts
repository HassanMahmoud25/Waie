/**
 * Parses a YouTube "contentDetails.duration" ISO-8601 value (e.g. "PT1H2M3S",
 * "PT45M", "PT30S") into whole seconds. Inverse of toIso8601Duration in
 * lib/utils/format.ts. Returns 0 for an unparseable value rather than
 * throwing -- a single malformed field should never abort an import.
 */
export function parseIso8601Duration(value: string): number {
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(value.trim());
  if (!match) return 0;

  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);
  return hours * 3600 + minutes * 60 + seconds;
}
