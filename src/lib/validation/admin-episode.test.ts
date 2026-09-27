import { test } from "node:test";
import assert from "node:assert/strict";
import { updateEpisodeContentSchema } from "./admin-episode";

/**
 * Covers only the participantIds field added for episode-specific
 * participants -- every other field on this schema predates this change and
 * is left untested here.
 */

test("participantIds: omitted entirely is valid (participants left untouched)", () => {
  const result = updateEpisodeContentSchema.safeParse({ title: "عنوان صالح" });
  assert.equal(result.success, true);
  if (result.success) assert.equal(result.data.participantIds, undefined);
});

test("participantIds: empty array is valid (an episode with no participants is correct, not an error)", () => {
  const result = updateEpisodeContentSchema.safeParse({ participantIds: [] });
  assert.equal(result.success, true);
  if (result.success) assert.deepEqual(result.data.participantIds, []);
});

test("participantIds: a single id is valid", () => {
  const result = updateEpisodeContentSchema.safeParse({ participantIds: ["person-1"] });
  assert.equal(result.success, true);
});

test("participantIds: multiple distinct ids preserve their given order", () => {
  const result = updateEpisodeContentSchema.safeParse({ participantIds: ["person-3", "person-1", "person-2"] });
  assert.equal(result.success, true);
  if (result.success) assert.deepEqual(result.data.participantIds, ["person-3", "person-1", "person-2"]);
});

test("participantIds: a duplicated id is rejected rather than silently deduped", () => {
  const result = updateEpisodeContentSchema.safeParse({ participantIds: ["person-1", "person-2", "person-1"] });
  assert.equal(result.success, false);
});
