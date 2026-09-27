import { test } from "node:test";
import assert from "node:assert/strict";
import { toParticipantRows } from "./episodes";

/**
 * toParticipantRows is the pure mapping updateEpisodeContent() uses to turn
 * the admin's ordered participantIds selection into EpisodeParticipant rows
 * -- extracted specifically so the ordering rule (array index -> position)
 * is testable without a database.
 */

test("toParticipantRows: empty selection produces no rows", () => {
  assert.deepEqual(toParticipantRows("ep-1", []), []);
});

test("toParticipantRows: a single participant gets position 0", () => {
  assert.deepEqual(toParticipantRows("ep-1", ["person-a"]), [{ episodeId: "ep-1", personId: "person-a", position: 0 }]);
});

test("toParticipantRows: selection order maps to increasing position, matching the PRD's example", () => {
  const rows = toParticipantRows("ep-42", ["ahmed-amer", "mostafa-khaled", "sherif-ali"]);
  assert.deepEqual(rows, [
    { episodeId: "ep-42", personId: "ahmed-amer", position: 0 },
    { episodeId: "ep-42", personId: "mostafa-khaled", position: 1 },
    { episodeId: "ep-42", personId: "sherif-ali", position: 2 },
  ]);
});

test("toParticipantRows: reordering the input array reorders the resulting positions", () => {
  const rows = toParticipantRows("ep-42", ["sherif-ali", "ahmed-amer"]);
  assert.deepEqual(rows, [
    { episodeId: "ep-42", personId: "sherif-ali", position: 0 },
    { episodeId: "ep-42", personId: "ahmed-amer", position: 1 },
  ]);
});
