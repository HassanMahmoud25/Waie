import { test } from "node:test";
import assert from "node:assert/strict";
import { buildRegistrationSeries, countNewUsers, resolveRegistrationWindow } from "./statistics";

const d = (y: number, m: number, day: number) => new Date(Date.UTC(y, m - 1, day));

test("countNewUsers: buckets a flat list of timestamps into every rolling/calendar window at once", () => {
  const now = d(2026, 9, 27);
  const dates = [
    d(2026, 9, 27), // today
    d(2026, 9, 21), // within 7d (6 days ago) and 30d and this month
    d(2026, 8, 30), // outside 7d, within 30d and this year, not this month
    d(2025, 12, 1), // outside everything except... nothing (not this year)
  ];
  const counts = countNewUsers(dates, now);
  assert.deepEqual(counts, { today: 1, last7Days: 2, last30Days: 3, thisMonth: 2, thisYear: 3 });
});

test("countNewUsers: empty registry is all zeros, not a crash", () => {
  assert.deepEqual(countNewUsers([], d(2026, 9, 27)), { today: 0, last7Days: 0, last30Days: 0, thisMonth: 0, thisYear: 0 });
});

test("resolveRegistrationWindow: fixed ranges use daily granularity", () => {
  const now = d(2026, 9, 27);
  assert.equal(resolveRegistrationWindow("7d", null, now).granularity, "day");
  assert.equal(resolveRegistrationWindow("30d", null, now).granularity, "day");
  assert.equal(resolveRegistrationWindow("90d", null, now).granularity, "day");
});

test("resolveRegistrationWindow: 1y uses monthly granularity", () => {
  assert.equal(resolveRegistrationWindow("1y", null, d(2026, 9, 27)).granularity, "month");
});

test("resolveRegistrationWindow: all-time picks daily for a short real history and monthly for a long one", () => {
  const now = d(2026, 9, 27);
  const youngApp = resolveRegistrationWindow("all", d(2026, 9, 22), now);
  assert.equal(youngApp.granularity, "day");

  const matureApp = resolveRegistrationWindow("all", d(2021, 1, 1), now);
  assert.equal(matureApp.granularity, "month");
});

test("buildRegistrationSeries: cumulative total carries a baseline forward from before the window", () => {
  const dates = [d(2026, 9, 1), d(2026, 9, 10), d(2026, 9, 12), d(2026, 9, 12)];
  const series = buildRegistrationSeries(dates, "day", d(2026, 9, 10), d(2026, 9, 12));

  assert.deepEqual(
    series.map((bucket) => bucket.key),
    ["2026-09-10", "2026-09-11", "2026-09-12"],
  );
  // The Sep 1 registration is outside the window but still counts toward the running total.
  assert.deepEqual(
    series.map((bucket) => [bucket.newUsers, bucket.totalUsers]),
    [
      [1, 2],
      [0, 2],
      [2, 4],
    ],
  );
});

test("buildRegistrationSeries: no registrations at all still produces a zero-filled window", () => {
  const series = buildRegistrationSeries([], "day", d(2026, 9, 10), d(2026, 9, 11));
  assert.deepEqual(
    series.map((bucket) => [bucket.newUsers, bucket.totalUsers]),
    [
      [0, 0],
      [0, 0],
    ],
  );
});

test("buildRegistrationSeries: monthly granularity normalizes to the first of each month", () => {
  const dates = [d(2026, 7, 15), d(2026, 8, 3)];
  const series = buildRegistrationSeries(dates, "month", d(2026, 7, 20), d(2026, 8, 5));
  assert.deepEqual(
    series.map((bucket) => bucket.key),
    ["2026-07", "2026-08"],
  );
  assert.deepEqual(
    series.map((bucket) => bucket.newUsers),
    [1, 1],
  );
});
