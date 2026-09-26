/**
 * Single source of truth for episode-collection pagination: the default
 * batch size and the shared cursor-page shape every incrementally-loaded
 * list (a database query or an in-memory array) is built on.
 *
 * Two kinds of callers use this:
 *   - DB-driven lists (e.g. ContentRepository.listEpisodesBySeriesCursor)
 *     fetch `limit + 1` rows ordered by a stable, unique-enough sort and
 *     hand the raw rows to toCursorPage(), which trims to `limit` and
 *     derives nextCursor/hasMore from whether that extra row existed.
 *   - Array-driven lists whose matching/ranking can't be pushed into SQL
 *     (search's Arabic-normalized ranking, admin's free-text episode
 *     search -- both already filter/rank the full candidate set in JS, a
 *     cost that's unavoidable and separately justified where it happens)
 *     call paginateByCursor(), which resumes after the item whose id
 *     matches the given cursor.
 * Neither should recompute nextCursor/hasMore on its own, and the cursor
 * itself is always just "the last returned item's own id" -- there is no
 * separate offset/page-number concept to keep in sync with it.
 */

export const DEFAULT_PAGE_SIZE = 20;

export type CursorPage<T> = {
  items: T[];
  /** The id to resume after, or null once the collection is exhausted. */
  nextCursor: string | null;
  hasMore: boolean;
};

/**
 * Turns up to `limit + 1` already-ordered rows (as fetched with `take:
 * limit + 1`) into a CursorPage: the extra row, if present, is trimmed off
 * and only proves more exist -- it's never shown, so no COUNT query is
 * needed to know whether there's a next batch.
 */
export function toCursorPage<T>(rows: T[], limit: number, getId: (item: T) => string): CursorPage<T> {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const last = items[items.length - 1];
  return { items, nextCursor: hasMore && last ? getId(last) : null, hasMore };
}

/**
 * Cursor pagination over an already filtered + ordered in-memory array --
 * for the two cases above where matching/ranking can't be expressed in SQL.
 * Resuming by id (rather than a numeric offset) keeps a batch correct even
 * if an item is added/removed between requests, since nothing shifts out
 * from under an id-based cursor the way it would under a plain offset. A
 * cursor that no longer matches anything (stale, or from a different
 * query/filter than the one now being requested) resumes from the start
 * rather than silently returning nothing.
 */
export function paginateByCursor<T>(
  items: T[],
  cursor: string | null,
  getId: (item: T) => string,
  limit: number = DEFAULT_PAGE_SIZE,
): CursorPage<T> {
  const afterIndex = cursor === null ? -1 : items.findIndex((item) => getId(item) === cursor);
  const start = afterIndex + 1;
  const page = items.slice(start, start + limit);
  const hasMore = start + page.length < items.length;
  const last = page[page.length - 1];
  return { items: page, nextCursor: hasMore && last ? getId(last) : null, hasMore };
}
