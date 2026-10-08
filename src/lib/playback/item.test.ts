import { test } from "node:test";
import assert from "node:assert/strict";
import { convertPosition, getResumePosition, scalePosition, toMediaItem, type MediaItem } from "./item";
import type { Episode } from "@/types/episode";

const episode: Episode = {
  id: "ep-1",
  slug: "waie-1",
  title: "وعي 1",
  description: "",
  youtubeVideoId: "abcdefghijk",
  thumbnailUrl: "https://i.ytimg.com/vi/abcdefghijk/maxresdefault.jpg",
  audioUrl: null,
  episodeNumber: 1,
  durationSeconds: 3600,
  publishedAt: new Date("2026-01-01T00:00:00Z"),
  status: "PUBLISHED",
  featured: false,
  seriesId: "s-1",
  topicIds: [],
  participants: [],
};

test("toMediaItem keeps the video timeline when the audio is the same recording", () => {
  const item = toMediaItem(episode, "سلسلة", { url: "https://cdn.example.com/1.mp3", durationSeconds: 3600 });
  assert.equal(item.audioUrl, "https://cdn.example.com/1.mp3");
  assert.equal(item.soundcloudEmbedSrc, null);
  assert.equal(item.audioDurationSeconds, undefined);
});

test("toMediaItem records a differently cut audio's own length", () => {
  const item = toMediaItem(episode, "سلسلة", { url: "https://cdn.example.com/1.mp3", durationSeconds: 3000 });
  assert.equal(item.audioDurationSeconds, 3000);
});

test("toMediaItem routes a SoundCloud page to the embed, never to <audio>", () => {
  const item = toMediaItem(episode, "سلسلة", { url: "https://soundcloud.com/waie/episode-1", durationSeconds: 3600 });
  assert.equal(item.audioUrl, null);
  assert.ok(item.soundcloudEmbedSrc?.startsWith("https://w.soundcloud.com/player/"));
});

test("toMediaItem with no resolved audio has no audio source", () => {
  const item = toMediaItem(episode, "سلسلة", null);
  assert.equal(item.audioUrl, null);
  assert.equal(item.soundcloudEmbedSrc, null);
});

test("scalePosition is the identity within the drift tolerance, proportional beyond it", () => {
  assert.equal(scalePosition(600, 3600, 3603), 600);
  assert.equal(scalePosition(1800, 3600, 3000), 1500);
  assert.equal(scalePosition(5000, 3600, 3000), 3000);
  assert.equal(scalePosition(42, 0, 3000), 42);
});

test("convertPosition moves positions between the video and a different audio cut", () => {
  const item: MediaItem = { ...toMediaItem(episode, "", null), audioUrl: "https://cdn.example.com/1.mp3", audioDurationSeconds: 1800 };
  assert.equal(convertPosition(item, 1200, "video", "audio"), 600);
  assert.equal(convertPosition(item, 600, "audio", "video"), 1200);
  assert.equal(convertPosition(item, 1200, "video", "video"), 1200);
});

test("getResumePosition skips trivial and finished progress", () => {
  const entry = (seconds: number, completed = false) => ({ seconds, durationSeconds: 3600, completed, updatedAt: 0 });
  assert.equal(getResumePosition(undefined, 3600), null);
  assert.equal(getResumePosition(entry(3), 3600), null);
  assert.equal(getResumePosition(entry(1200), 3600), 1200);
  assert.equal(getResumePosition(entry(3590), 3600), null);
  assert.equal(getResumePosition(entry(1200, true), 3600), null);
  // Progress recorded on a 1800s audio cut resumes proportionally on the 3600s video.
  assert.equal(getResumePosition({ ...entry(600), durationSeconds: 1800 }, 3600), 1200);
});
