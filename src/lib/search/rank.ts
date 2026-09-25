import { toAsciiDigits } from "./normalize";

/**
 * Relevance tiers for contentRepository.search() -- highest wins per item
 * (see scoreTitle/scoreEpisodeNumber/scoreContains below), never summed.
 * Order, from strongest to weakest signal:
 *   exact title > exact episode number > title starts with > title contains
 *   > partial episode number > series title > description.
 * An exact episode number sits just under an exact title because a number
 * uniquely identifies one episode with the same certainty as its literal
 * name; a partial number sits below every title tier because a short prefix
 * ("1") can validly match many episodes, unlike a title substring.
 */
export const SCORE = {
  EXACT_TITLE: 100,
  EXACT_NUMBER: 95,
  TITLE_STARTS_WITH: 90,
  TITLE_CONTAINS: 80,
  PARTIAL_NUMBER: 60,
  SERIES_TITLE: 50,
  DESCRIPTION: 30,
} as const;

/**
 * The single digit run in a query, digit-script-normalized -- null when the
 * query has no digits or more than one separate run (e.g. "111 222"), so a
 * query never guesses which of several numbers the searcher meant. Leading
 * zeros are stripped so padded input ("٠١١") still matches episode 11.
 * Works on mixed queries ("حلقة 111", "episode ١١١") since it only looks at
 * digit characters, ignoring whatever surrounds them.
 */
export function extractNumberToken(rawQuery: string): string | null {
  const digitsOnly = toAsciiDigits(rawQuery.trim().normalize("NFKC"));
  const runs = digitsOnly.match(/\d+/g);
  if (!runs || runs.length !== 1) return null;
  return runs[0].replace(/^0+(?=\d)/, "");
}

/**
 * Episode-number score: exact if the episode's number's decimal string
 * equals the token, partial if it merely *starts with* it -- deliberately
 * never "contains", so a query only narrows a number from the left
 * (deterministic prefix search: "11" matches 11/111/1100, never 211/911;
 * "31" never matches 111). No edit-distance/fuzzy comparison.
 */
export function scoreEpisodeNumber(episodeNumber: number | null, numberToken: string | null): number {
  if (episodeNumber === null || !numberToken) return 0;
  const numStr = String(episodeNumber);
  if (numStr === numberToken) return SCORE.EXACT_NUMBER;
  if (numStr.startsWith(numberToken)) return SCORE.PARTIAL_NUMBER;
  return 0;
}

/**
 * Title tier score: exact match, prefix match, then plain substring.
 * Both arguments must already be normalizeSearchText()-normalized.
 */
export function scoreTitle(normalizedTitle: string, normalizedQuery: string): number {
  if (!normalizedQuery || !normalizedTitle) return 0;
  if (normalizedTitle === normalizedQuery) return SCORE.EXACT_TITLE;
  if (normalizedTitle.startsWith(normalizedQuery)) return SCORE.TITLE_STARTS_WITH;
  if (normalizedTitle.includes(normalizedQuery)) return SCORE.TITLE_CONTAINS;
  return 0;
}

/** Plain substring check at a given tier -- used for series-title/description matches. Both arguments must already be normalized. */
export function scoreContains(normalizedText: string, normalizedQuery: string, tierScore: number): number {
  if (!normalizedQuery || !normalizedText) return 0;
  return normalizedText.includes(normalizedQuery) ? tierScore : 0;
}
