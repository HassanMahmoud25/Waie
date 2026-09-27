import { test } from "node:test";
import assert from "node:assert/strict";
import { buildMonthlyBuckets } from "./statistics";

/**
 * buildMonthlyBuckets is the pure bucketing rule getPublishingActivity()
 * uses to turn a flat list of publish dates into a fixed trailing window of
 * calendar months -- extracted so the "quiet months read as 0, not missing"
 * behavior is testable without a database.
 */

test("buildMonthlyBuckets: empty input still produces every month in the window, all zero", () => {
  const buckets = buildMonthlyBuckets([], 3, new Date(Date.UTC(2026, 8, 15)));
  assert.deepEqual(
    buckets.map((b) => b.month),
    ["2026-07", "2026-08", "2026-09"],
  );
  assert.deepEqual(buckets.map((b) => b.count), [0, 0, 0]);
});

test("buildMonthlyBuckets: counts dates into their calendar month", () => {
  const dates = [
    new Date(Date.UTC(2026, 7, 1)),
    new Date(Date.UTC(2026, 7, 20)),
    new Date(Date.UTC(2026, 8, 5)),
  ];
  const buckets = buildMonthlyBuckets(dates, 3, new Date(Date.UTC(2026, 8, 15)));
  assert.deepEqual(buckets.map((b) => b.count), [0, 2, 1]);
});

test("buildMonthlyBuckets: dates outside the trailing window are dropped, not overflowed into an edge bucket", () => {
  const dates = [new Date(Date.UTC(2020, 0, 1))];
  const buckets = buildMonthlyBuckets(dates, 2, new Date(Date.UTC(2026, 8, 15)));
  assert.deepEqual(buckets.map((b) => b.count), [0, 0]);
});

test("buildMonthlyBuckets: window spanning a year boundary keeps months in order", () => {
  const buckets = buildMonthlyBuckets([], 3, new Date(Date.UTC(2026, 0, 10)));
  assert.deepEqual(
    buckets.map((b) => b.month),
    ["2025-11", "2025-12", "2026-01"],
  );
});
