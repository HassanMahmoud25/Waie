import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_PAGE_SIZE, paginateByCursor, toCursorPage, type CursorPage } from "./pagination";

function range(count: number): number[] {
  return Array.from({ length: count }, (_, index) => index + 1);
}
const idOf = (n: number) => String(n);

// ---------------------------------------------------------------------------
// toCursorPage -- the DB-driven shape: caller already fetched `limit + 1`
// ordered rows; this trims the extra row and derives nextCursor/hasMore.
// ---------------------------------------------------------------------------

test("toCursorPage: exactly `limit` rows fetched (no extra) means no more", () => {
  const rows = range(20);
  const page = toCursorPage(rows, 20, idOf);
  assert.equal(page.items.length, 20);
  assert.equal(page.hasMore, false);
  assert.equal(page.nextCursor, null);
});

test("toCursorPage: `limit + 1` rows fetched trims the extra and reports hasMore", () => {
  const rows = range(21); // caller fetched take: limit + 1
  const page = toCursorPage(rows, 20, idOf);
  assert.equal(page.items.length, 20);
  assert.deepEqual(page.items, range(20));
  assert.equal(page.hasMore, true);
  assert.equal(page.nextCursor, idOf(20));
});

test("toCursorPage: empty rows is safe", () => {
  const page = toCursorPage<number>([], 20, idOf);
  assert.deepEqual(page.items, []);
  assert.equal(page.hasMore, false);
  assert.equal(page.nextCursor, null);
});

// ---------------------------------------------------------------------------
// paginateByCursor -- the JS-array-driven shape (search, admin search):
// resume after the item whose id matches `cursor`.
// ---------------------------------------------------------------------------

test("113 items at limit 20: three full batches of 20, then 20, 20, 13", () => {
  const items = range(113);
  const expectedSizes = [20, 20, 20, 20, 20, 13];
  let cursor: string | null = null;
  const collected: number[] = [];

  for (let round = 0; round < 6; round++) {
    const page: CursorPage<number> = paginateByCursor(items, cursor, idOf, 20);
    assert.equal(page.items.length, expectedSizes[round], `round ${round + 1}`);
    collected.push(...page.items);
    cursor = page.nextCursor;
  }
  assert.equal(cursor, null, "exhausted after the 6th batch");
  assert.deepEqual(collected, items, "batches concatenate back into the original order with nothing missing or duplicated");
});

test("DEFAULT_PAGE_SIZE is 20 and is what paginateByCursor uses when unspecified", () => {
  assert.equal(DEFAULT_PAGE_SIZE, 20);
  const page = paginateByCursor(range(113), null, idOf);
  assert.equal(page.items.length, 20);
});

// ---------------------------------------------------------------------------
// Boundaries
// ---------------------------------------------------------------------------

test("empty collection: first batch is safe and empty, hasMore false", () => {
  const page = paginateByCursor<number>([], null, idOf, 20);
  assert.deepEqual(page.items, []);
  assert.equal(page.nextCursor, null);
  assert.equal(page.hasMore, false);
});

test("exactly one full batch (20 items): single batch, no next cursor", () => {
  const page = paginateByCursor(range(20), null, idOf, 20);
  assert.equal(page.items.length, 20);
  assert.equal(page.nextCursor, null);
  assert.equal(page.hasMore, false);
});

test("21 items: first batch has 20, second batch has exactly 1", () => {
  const items = range(21);
  const first = paginateByCursor(items, null, idOf, 20);
  assert.equal(first.items.length, 20);
  assert.equal(first.hasMore, true);
  const second = paginateByCursor(items, first.nextCursor, idOf, 20);
  assert.equal(second.items.length, 1);
  assert.equal(second.items[0], 21);
  assert.equal(second.nextCursor, null);
});

test("40 items: exactly two full batches", () => {
  const items = range(40);
  const first = paginateByCursor(items, null, idOf, 20);
  const second = paginateByCursor(items, first.nextCursor, idOf, 20);
  assert.equal(first.items.length, 20);
  assert.equal(second.items.length, 20);
  assert.equal(second.hasMore, false);
});

test("41 items: a third batch with exactly 1 item", () => {
  const items = range(41);
  const first = paginateByCursor(items, null, idOf, 20);
  const second = paginateByCursor(items, first.nextCursor, idOf, 20);
  const third = paginateByCursor(items, second.nextCursor, idOf, 20);
  assert.equal(third.items.length, 1);
  assert.equal(third.items[0], 41);
  assert.equal(third.hasMore, false);
});

test("a cursor that no longer matches anything (stale, or a different query's cursor) resumes from the start instead of returning nothing", () => {
  const items = range(20);
  const page = paginateByCursor(items, "not-a-real-id", idOf, 20);
  assert.deepEqual(page.items, items);
});

test("null cursor always means 'from the start'", () => {
  const items = range(113);
  assert.deepEqual(paginateByCursor(items, null, idOf, 20).items, range(20));
});

// ---------------------------------------------------------------------------
// Filtering: filter -> correct matching dataset -> pagination applied after
// ---------------------------------------------------------------------------

type FakeEpisode = { id: string; topicId: string };

function buildCatalog(): FakeEpisode[] {
  // 25 episodes tagged "sabr", interleaved with 25 tagged "tawbah" -- if
  // pagination ran before filtering, the first batch of the unfiltered 50
  // would mix both topics; it must not.
  const catalog: FakeEpisode[] = [];
  for (let i = 1; i <= 50; i++) {
    catalog.push({ id: String(i), topicId: i % 2 === 0 ? "sabr" : "tawbah" });
  }
  return catalog;
}

test("filtering happens before pagination: a topic filter's first batch only contains that topic's items", () => {
  const catalog = buildCatalog();
  const filtered = catalog.filter((episode) => episode.topicId === "sabr");
  assert.equal(filtered.length, 25);

  const getId = (e: FakeEpisode) => e.id;
  const first = paginateByCursor(filtered, null, getId, 20);
  const second = paginateByCursor(filtered, first.nextCursor, getId, 20);
  assert.equal(first.items.length, 20);
  assert.equal(second.items.length, 5);
  assert.ok(first.items.every((episode) => episode.topicId === "sabr"));
  assert.ok(second.items.every((episode) => episode.topicId === "sabr"));
});

// ---------------------------------------------------------------------------
// Ordering: pagination must preserve whatever order the list already had
// ---------------------------------------------------------------------------

test("pagination preserves existing order -- it never re-sorts", () => {
  // Descending, mirroring the app's default youtubePublishedAt-desc order.
  const items = range(45).reverse();
  const first = paginateByCursor(items, null, idOf, 20);
  const second = paginateByCursor(items, first.nextCursor, idOf, 20);
  const third = paginateByCursor(items, second.nextCursor, idOf, 20);

  assert.deepEqual(first.items, items.slice(0, 20));
  assert.deepEqual(second.items, items.slice(20, 40));
  assert.deepEqual(third.items, items.slice(40, 45));
  assert.equal(first.items[0], 45);
  assert.equal(third.items.at(-1), 1);
});

// ---------------------------------------------------------------------------
// Search / admin search: pagination must not be limited to the first batch
// ---------------------------------------------------------------------------

test("search-style pagination: ranked results beyond the first batch remain reachable", () => {
  // Simulates contentRepository.search()'s output: already ranked, full
  // candidate set (never pre-limited to a batch before ranking).
  const ranked = range(35).reverse(); // highest-ranked first
  const first = paginateByCursor(ranked, null, idOf, 20);
  const second = paginateByCursor(ranked, first.nextCursor, idOf, 20);

  assert.equal(first.items.length, 20);
  assert.equal(second.items.length, 15);
  // The 21st-ranked result is real content, reachable in the second batch --
  // not dropped because ranking only ever looked at a first batch of episodes.
  assert.equal(second.items[0], ranked[20]);
});

test("no duplicate or missing ids across every batch, for an odd-sized collection (58, like the largest real series)", () => {
  const items = range(58);
  let cursor: string | null = null;
  const collected: number[] = [];
  for (let round = 0; round < 10; round++) {
    const page: CursorPage<number> = paginateByCursor(items, cursor, idOf, 20);
    collected.push(...page.items);
    if (!page.hasMore) break;
    cursor = page.nextCursor;
  }
  assert.deepEqual(collected, items);
  assert.equal(new Set(collected).size, 58);
});
