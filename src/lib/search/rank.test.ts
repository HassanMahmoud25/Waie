import { test } from "node:test";
import assert from "node:assert/strict";
import { SCORE, extractNumberToken, scoreContains, scoreEpisodeNumber, scoreTitle } from "./rank";
import { normalizeSearchText } from "./normalize";

// ---------------------------------------------------------------------------
// extractNumberToken
// ---------------------------------------------------------------------------

test("extractNumberToken reads a plain ASCII or Arabic-Indic query", () => {
  assert.equal(extractNumberToken("111"), "111");
  assert.equal(extractNumberToken("١١١"), "111");
  assert.equal(extractNumberToken("11"), "11");
  assert.equal(extractNumberToken("١١"), "11");
  assert.equal(extractNumberToken("1"), "1");
});

test("extractNumberToken extracts the single digit run out of a mixed query", () => {
  assert.equal(extractNumberToken("حلقة 111"), "111");
  assert.equal(extractNumberToken("الحلقة ١١١"), "111");
  assert.equal(extractNumberToken("episode 111"), "111");
  assert.equal(extractNumberToken("episode ١١١"), "111");
});

test("extractNumberToken returns null for zero or multiple digit runs", () => {
  assert.equal(extractNumberToken("محاضرة"), null);
  assert.equal(extractNumberToken("111 222"), null);
  assert.equal(extractNumberToken("حلقة 111 عن 222"), null);
});

test("extractNumberToken strips leading zeros", () => {
  assert.equal(extractNumberToken("011"), "11");
  assert.equal(extractNumberToken("٠١١"), "11");
  assert.equal(extractNumberToken("0"), "0");
});

// ---------------------------------------------------------------------------
// scoreEpisodeNumber -- the exact/partial/none decision table from the
// approved design, including the explicit negative cases.
// ---------------------------------------------------------------------------

test("scoreEpisodeNumber: exact match", () => {
  assert.equal(scoreEpisodeNumber(111, "111"), SCORE.EXACT_NUMBER);
  assert.equal(scoreEpisodeNumber(11, "11"), SCORE.EXACT_NUMBER);
});

test("scoreEpisodeNumber: partial (prefix) match", () => {
  assert.equal(scoreEpisodeNumber(111, "11"), SCORE.PARTIAL_NUMBER);
  assert.equal(scoreEpisodeNumber(111, "1"), SCORE.PARTIAL_NUMBER);
  assert.equal(scoreEpisodeNumber(11, "1"), SCORE.PARTIAL_NUMBER);
});

test("scoreEpisodeNumber: 31 does not match 111 (explicit negative case)", () => {
  assert.equal(scoreEpisodeNumber(111, "31"), 0);
});

test("scoreEpisodeNumber: a short prefix never matches a number that merely contains it, only one that starts with it", () => {
  // "211" contains "11" but does not start with it.
  assert.equal(scoreEpisodeNumber(211, "11"), 0);
  // "211" does start with "2".
  assert.equal(scoreEpisodeNumber(211, "2"), SCORE.PARTIAL_NUMBER);
});

test("scoreEpisodeNumber: no signal without a number or a token", () => {
  assert.equal(scoreEpisodeNumber(null, "111"), 0);
  assert.equal(scoreEpisodeNumber(111, null), 0);
});

// ---------------------------------------------------------------------------
// End-to-end episode-number scenarios against a small catalog, exactly the
// cases enumerated in the approved design.
// ---------------------------------------------------------------------------

type FakeEpisode = { number: number; title: string };

const CATALOG: FakeEpisode[] = [
  { number: 111, title: "وعي 111 | في الصبر" },
  { number: 11, title: "وعي 11 | في التوبة" },
  { number: 211, title: "وعي 211 | في الإخلاص" },
  { number: 31, title: "وعي 31 | في الرضا" },
];

function matchingNumbers(query: string): number[] {
  const token = extractNumberToken(query);
  return CATALOG.filter((episode) => scoreEpisodeNumber(episode.number, token) > 0).map((episode) => episode.number);
}

test("query '111' matches only episode 111, as an exact match", () => {
  const token = extractNumberToken("111");
  assert.equal(scoreEpisodeNumber(111, token), SCORE.EXACT_NUMBER);
  assert.deepEqual(matchingNumbers("111").sort(), [111]);
});

test("query '١١١' behaves identically to '111'", () => {
  assert.deepEqual(matchingNumbers("١١١"), matchingNumbers("111"));
});

test("query '11' matches episode 11 (exact) and 111 (partial), not 211/31", () => {
  const results = matchingNumbers("11").sort((a, b) => a - b);
  assert.deepEqual(results, [11, 111]);
  const token = extractNumberToken("11");
  assert.equal(scoreEpisodeNumber(11, token), SCORE.EXACT_NUMBER);
  assert.equal(scoreEpisodeNumber(111, token), SCORE.PARTIAL_NUMBER);
});

test("query '١١' behaves identically to '11'", () => {
  assert.deepEqual(matchingNumbers("١١").sort(), matchingNumbers("11").sort());
});

test("query '1' matches every '1*' prefix (11, 111), not 211 or 31", () => {
  assert.deepEqual(matchingNumbers("1").sort((a, b) => a - b), [11, 111]);
});

test("query '31' matches only episode 31, never 111", () => {
  assert.deepEqual(matchingNumbers("31"), [31]);
});

test("mixed queries extract the number and match episode 111 exactly", () => {
  for (const query of ["حلقة 111", "الحلقة ١١١", "episode 111", "episode ١١١"]) {
    const token = extractNumberToken(query);
    assert.equal(scoreEpisodeNumber(111, token), SCORE.EXACT_NUMBER, `query: ${query}`);
  }
});

test("ambiguous multi-number queries score no episode-number signal", () => {
  const token = extractNumberToken("111 222");
  assert.equal(token, null);
  for (const episode of CATALOG) {
    assert.equal(scoreEpisodeNumber(episode.number, token), 0);
  }
});

// ---------------------------------------------------------------------------
// scoreTitle / scoreContains tiers
// ---------------------------------------------------------------------------

test("scoreTitle: exact > starts-with > contains > no match", () => {
  const query = normalizeSearchText("الصبر");
  assert.equal(scoreTitle(normalizeSearchText("الصبر"), query), SCORE.EXACT_TITLE);
  assert.equal(scoreTitle(normalizeSearchText("الصبر الجميل"), query), SCORE.TITLE_STARTS_WITH);
  assert.equal(scoreTitle(normalizeSearchText("في الصبر"), query), SCORE.TITLE_CONTAINS);
  assert.equal(scoreTitle(normalizeSearchText("التوبة"), query), 0);
});

test("scoreTitle tolerates hamza/alef-maksura/taa-marbuta variants between query and text", () => {
  assert.equal(scoreTitle(normalizeSearchText("أحمد"), normalizeSearchText("احمد")), SCORE.EXACT_TITLE);
  assert.equal(scoreTitle(normalizeSearchText("موسى"), normalizeSearchText("موسي")), SCORE.EXACT_TITLE);
});

test("scoreContains only fires at the given tier when the text actually contains the query", () => {
  assert.equal(scoreContains("series about patience", "patience", SCORE.SERIES_TITLE), SCORE.SERIES_TITLE);
  assert.equal(scoreContains("series about hope", "patience", SCORE.SERIES_TITLE), 0);
  assert.equal(scoreContains("", "patience", SCORE.SERIES_TITLE), 0);
});

test("an item's score is the max across tiers: an episode whose title doesn't mention the number still ranks via an exact episode-number match", () => {
  const title = normalizeSearchText("في الصبر");
  const query = normalizeSearchText("111");
  const titleScore = scoreTitle(title, query);
  const numberScore = scoreEpisodeNumber(111, extractNumberToken("111"));
  assert.equal(titleScore, 0);
  assert.equal(Math.max(titleScore, numberScore), SCORE.EXACT_NUMBER);
});
