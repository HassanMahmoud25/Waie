import { test } from "node:test";
import assert from "node:assert/strict";
import { safeNextPath } from "./server";

test("safeNextPath keeps same-site absolute paths, query included", () => {
  assert.equal(safeNextPath("/admin"), "/admin");
  assert.equal(safeNextPath("/admin/episodes?status=DRAFT"), "/admin/episodes?status=DRAFT");
});

test("safeNextPath rejects anything that could leave the site", () => {
  for (const value of ["//evil.com", "/\\evil.com", "https://evil.com", "http://localhost/admin", "evil.com", "javascript:alert(1)", ""]) {
    assert.equal(safeNextPath(value), null, value);
  }
});

test("safeNextPath rejects non-strings", () => {
  for (const value of [null, undefined, 42, ["/admin"], { path: "/admin" }]) {
    assert.equal(safeNextPath(value), null);
  }
});
