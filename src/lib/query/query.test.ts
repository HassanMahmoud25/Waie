import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import { makeQueryClient } from "./client";
import { queryKeys } from "./keys";
import { clearViewerQueries, invalidateAfterMutation } from "./invalidate";

// Inactive queries hold gc timers that would keep the test process alive.
const clients: ReturnType<typeof makeQueryClient>[] = [];
afterEach(() => clients.splice(0).forEach((client) => client.clear()));
function trackedClient() {
  const client = makeQueryClient();
  clients.push(client);
  return client;
}

function seededClient() {
  const client = trackedClient();
  client.setQueryData(queryKeys.episodes.byIds(["e1"]), []);
  client.setQueryData(queryKeys.series.coverThumbnails(["s1"]), {});
  client.setQueryData(queryKeys.topics.quickList(), []);
  client.setQueryData(queryKeys.search.results("صلاة"), { episodes: [], series: [], topics: [] });
  return client;
}

function invalidatedRoots(client: ReturnType<typeof makeQueryClient>): string[] {
  return client
    .getQueryCache()
    .getAll()
    .filter((query) => query.state.isInvalidated)
    .map((query) => String(query.queryKey[0]))
    .sort();
}

test("id-set keys ignore order and duplicates", () => {
  assert.deepEqual(queryKeys.episodes.byIds(["b", "a", "b"]), queryKeys.episodes.byIds(["a", "b"]));
  assert.deepEqual(queryKeys.series.coverThumbnails(["2", "1"]), queryKeys.series.coverThumbnails(["1", "2"]));
});

test("search keys normalize surrounding and repeated whitespace", () => {
  assert.deepEqual(queryKeys.search.results("  قصص   الأنبياء "), queryKeys.search.results("قصص الأنبياء"));
});

test("each mutation invalidates only the datasets it affects", () => {
  const expected = {
    episode: ["episodes", "search", "series"],
    series: ["search", "series"],
    topic: ["search", "topics"],
    person: ["episodes", "search"],
    sync: ["episodes", "search", "series"],
  } as const;

  for (const [mutation, roots] of Object.entries(expected)) {
    const client = seededClient();
    invalidateAfterMutation(client, mutation as keyof typeof expected);
    assert.deepEqual(invalidatedRoots(client), roots, mutation);
    // Invalidation marks stale; it never throws away data that's still usable.
    assert.equal(client.getQueryCache().getAll().length, 4, mutation);
  }
});

test("login/logout drops the previous viewer's id-keyed lookups but keeps public caches", () => {
  const client = seededClient();
  clearViewerQueries(client);
  const remaining = client
    .getQueryCache()
    .getAll()
    .map((query) => String(query.queryKey[0]))
    .sort();
  assert.deepEqual(remaining, ["search", "topics"]);
});

test("the search cache is capped instead of growing per keystroke", async () => {
  const client = trackedClient();
  for (let i = 0; i < 50; i++) {
    client.setQueryData(queryKeys.search.results(`query ${i}`), { episodes: [], series: [], topics: [] });
    await Promise.resolve();
  }
  await new Promise((resolve) => setTimeout(resolve, 0));
  const searches = client.getQueryCache().findAll({ queryKey: queryKeys.search.all });
  assert.ok(searches.length <= 20, `expected at most 20 cached searches, got ${searches.length}`);
  // The newest query always survives.
  assert.ok(client.getQueryData(queryKeys.search.results("query 49")));
});
