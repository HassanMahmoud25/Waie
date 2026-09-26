import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeSearchText } from "./normalize";
import { extractNumberToken, matchesAdminEpisodeQuery, type AdminEpisodeSearchCandidate } from "./rank";

/**
 * Mirrors searchAdminEpisodesCursor()'s own two-step shape (prisma-content-repository.ts):
 * Prisma filters by status first (a plain, DB-level equality -- not re-tested
 * here, nothing to normalize), then this JS layer filters the status-scoped
 * rows by the free-text/episode-number query. `episodes` below stands in for
 * whatever Prisma already returned for a given status.
 */
type FixtureEpisode = {
  id: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  title: string | null;
  youtubeTitle: string;
  slug: string;
  description: string | null;
  youtubeDescription: string | null;
  seriesTitle: string | null;
  episodeNumber: number | null;
};

// Slugs deliberately do NOT embed the episode number -- real Waie episodes
// have Arabic titles that collapse to "" under slugify() (lib/sync/slug.ts),
// so they fall back to their opaque YouTube video id. Embedding the number
// in a test slug (e.g. "waei-211") would make "11" match episode 211 via
// plain slug-substring text search, which is correct field behavior but
// would muddy these tests' actual target: the episode-number prefix rule.
const CATALOG: FixtureEpisode[] = [
  {
    id: "ep-111",
    status: "PUBLISHED",
    title: "وعي 111 | في الصبر",
    youtubeTitle: "وعي 111 | في الصبر",
    slug: "dQw4w9WgXcQ",
    description: "حلقة عن فضل الصبر عند الابتلاء",
    youtubeDescription: null,
    seriesTitle: "سلسلة الأخلاق",
    episodeNumber: 111,
  },
  {
    id: "ep-11",
    status: "DRAFT",
    title: null,
    youtubeTitle: "وعي 11 | في التوبة",
    slug: "jNQXAC9IVRw",
    description: null,
    youtubeDescription: "حلقة عن التوبة النصوح",
    seriesTitle: null,
    episodeNumber: 11,
  },
  {
    id: "ep-211",
    status: "PUBLISHED",
    title: "وعي 211 | في الإخلاص",
    youtubeTitle: "وعي 211 | في الإخلاص",
    slug: "M7lc1UVf-VE",
    description: "حديث عن الإخلاص في العمل",
    youtubeDescription: null,
    seriesTitle: "سلسلة الأخلاق",
    episodeNumber: 211,
  },
  {
    id: "ep-31",
    status: "ARCHIVED",
    title: "وعي 31 | في الرضا",
    youtubeTitle: "وعي 31 | في الرضا",
    slug: "kJQP7kiw5Fk",
    description: "حلقة قديمة عن الرضا بالقضاء",
    youtubeDescription: null,
    seriesTitle: "سلسلة القلب",
    episodeNumber: 31,
  },
];

function toCandidate(episode: FixtureEpisode): AdminEpisodeSearchCandidate {
  return {
    normalizedTitle: normalizeSearchText(episode.title ?? episode.youtubeTitle),
    normalizedYoutubeTitle: normalizeSearchText(episode.youtubeTitle),
    normalizedSlug: normalizeSearchText(episode.slug),
    normalizedDescription: episode.description ? normalizeSearchText(episode.description) : null,
    normalizedYoutubeDescription: episode.youtubeDescription ? normalizeSearchText(episode.youtubeDescription) : null,
    normalizedSeriesTitle: episode.seriesTitle ? normalizeSearchText(episode.seriesTitle) : null,
    episodeNumber: episode.episodeNumber,
  };
}

/** Simulates searchAdminEpisodesCursor(): Prisma-level status filter, then the JS query filter. */
function searchCatalog(query: string, status?: FixtureEpisode["status"]): string[] {
  const trimmed = query.trim();
  const statusScoped = status ? CATALOG.filter((episode) => episode.status === status) : CATALOG;
  if (!trimmed) return statusScoped.map((episode) => episode.id);

  const normalizedQuery = normalizeSearchText(trimmed);
  const numberToken = extractNumberToken(trimmed);
  if (!normalizedQuery && !numberToken) return [];

  return statusScoped
    .filter((episode) => matchesAdminEpisodeQuery(toCandidate(episode), normalizedQuery, numberToken))
    .map((episode) => episode.id);
}

test("'111' finds episode 111 only", () => {
  assert.deepEqual(searchCatalog("111"), ["ep-111"]);
});

test("'١١١' behaves exactly like '111'", () => {
  assert.deepEqual(searchCatalog("١١١"), searchCatalog("111"));
});

test("'11' finds episode 11 and 111 (prefix), not 211", () => {
  const results = searchCatalog("11").sort();
  assert.deepEqual(results, ["ep-11", "ep-111"]);
});

test("'١١' behaves exactly like '11'", () => {
  assert.deepEqual(searchCatalog("١١").sort(), searchCatalog("11").sort());
});

test("'11' does NOT match episode 211", () => {
  assert.ok(!searchCatalog("11").includes("ep-211"));
});

test("'31' does NOT match episode 111 (or any other number), only 31", () => {
  assert.deepEqual(searchCatalog("31"), ["ep-31"]);
});

test("'حلقة 111' extracts the number token and finds episode 111", () => {
  assert.deepEqual(searchCatalog("حلقة 111"), ["ep-111"]);
});

test("'episode ١١١' extracts the number token and finds episode 111", () => {
  assert.deepEqual(searchCatalog("episode ١١١"), ["ep-111"]);
});

test("status and search combine with AND: '11' prefix scoped to PUBLISHED only returns 111, not the draft 11", () => {
  assert.deepEqual(searchCatalog("11", "PUBLISHED"), ["ep-111"]);
});

test("status and search combine with AND: '11' prefix scoped to DRAFT only returns the draft episode 11", () => {
  assert.deepEqual(searchCatalog("11", "DRAFT"), ["ep-11"]);
});

test("status alone (no query) returns every episode in that status, unfiltered by text", () => {
  assert.deepEqual(searchCatalog("", "ARCHIVED"), ["ep-31"]);
});

test("series title is searchable and finds every episode in that series", () => {
  assert.deepEqual(searchCatalog("سلسلة الأخلاق").sort(), ["ep-111", "ep-211"].sort());
});

test("a series title query does not match an episode in a different series", () => {
  assert.ok(!searchCatalog("سلسلة الأخلاق").includes("ep-31"));
});

test("description matching remains functional (title-only override, DB-set description)", () => {
  assert.deepEqual(searchCatalog("الابتلاء"), ["ep-111"]);
});

test("youtubeDescription matching remains functional for episodes with no CMS-set description", () => {
  assert.deepEqual(searchCatalog("النصوح"), ["ep-11"]);
});

test("ambiguous multi-number query yields no episode-number match, only text matches (none here)", () => {
  assert.deepEqual(searchCatalog("111 211"), []);
});
