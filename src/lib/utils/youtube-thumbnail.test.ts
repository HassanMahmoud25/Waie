import { test } from "node:test";
import assert from "node:assert/strict";
import { youtubeThumbnailVariant } from "./youtube-thumbnail";

test("youtubeThumbnailVariant swaps maxresdefault for a smaller generated size", () => {
  const maxres = "https://i.ytimg.com/vi/abcdefghijk/maxresdefault.jpg";
  assert.equal(youtubeThumbnailVariant(maxres, "mqdefault"), "https://i.ytimg.com/vi/abcdefghijk/mqdefault.jpg");
  assert.equal(youtubeThumbnailVariant(`${maxres}?_retry=1`, "hqdefault"), "https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg");
});

test("youtubeThumbnailVariant leaves other images alone", () => {
  assert.equal(youtubeThumbnailVariant("https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg", "mqdefault"), null);
  assert.equal(youtubeThumbnailVariant("/series/companions.png", "mqdefault"), null);
  assert.equal(youtubeThumbnailVariant("https://cdn.example.com/maxresdefault.jpg", "mqdefault"), null);
});
