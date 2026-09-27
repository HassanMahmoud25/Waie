import { test } from "node:test";
import assert from "node:assert/strict";
import { createPersonSchema, updatePersonSchema } from "./admin-person";

test("createPersonSchema: name + imageUrl is valid", () => {
  const result = createPersonSchema.safeParse({ name: "مصطفى خالد", imageUrl: "https://example.com/photo.jpg" });
  assert.equal(result.success, true);
});

test("createPersonSchema: imageUrl is optional -- a person may have no photo yet", () => {
  const result = createPersonSchema.safeParse({ name: "مصطفى خالد" });
  assert.equal(result.success, true);
});

test("createPersonSchema: a name that's too short is rejected", () => {
  const result = createPersonSchema.safeParse({ name: "م" });
  assert.equal(result.success, false);
});

test("createPersonSchema: imageUrl accepts a root-relative path (the existing public/*.jpg convention)", () => {
  const result = createPersonSchema.safeParse({ name: "مصطفى خالد", imageUrl: "/people/mostafa-khaled.jpg" });
  assert.equal(result.success, true);
});

test("createPersonSchema: imageUrl rejects a bare hostname with no scheme", () => {
  const result = createPersonSchema.safeParse({ name: "مصطفى خالد", imageUrl: "example.com/photo.jpg" });
  assert.equal(result.success, false);
});

test("createPersonSchema: an empty imageUrl string clears to null rather than being rejected", () => {
  const result = createPersonSchema.safeParse({ name: "مصطفى خالد", imageUrl: "" });
  assert.equal(result.success, true);
  if (result.success) assert.equal(result.data.imageUrl, null);
});

test("updatePersonSchema: every field is optional -- callers send only what changed", () => {
  const result = updatePersonSchema.safeParse({});
  assert.equal(result.success, true);
});

test("updatePersonSchema: imageUrl accepts an explicit null (clearing the photo)", () => {
  const result = updatePersonSchema.safeParse({ imageUrl: null });
  assert.equal(result.success, true);
  if (result.success) assert.equal(result.data.imageUrl, null);
});
