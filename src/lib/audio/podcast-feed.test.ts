import { test } from "node:test";
import assert from "node:assert/strict";
import { matchFeedItem, normalizeTitle, parseEpisodeNumber, parseFeed, type FeedItem } from "./podcast-feed";

function item(title: string, durationSeconds: number, url = `https://feeds.example.com/${encodeURIComponent(title)}.mp3`): FeedItem {
  return { title, url, durationSeconds, number: parseEpisodeNumber(title), titleKey: normalizeTitle(title) };
}

test("parseEpisodeNumber reads 'وعي N' and the feed's bare 'N |', in any digit script", () => {
  assert.equal(parseEpisodeNumber("وعي 111 | الصحبة"), 111);
  assert.equal(parseEpisodeNumber("وعي ١١١ | الصحبة"), 111);
  assert.equal(parseEpisodeNumber("٩٥ | التوبة"), 95);
  assert.equal(parseEpisodeNumber("٧۳ | mixed scripts"), 73);
  assert.equal(parseEpisodeNumber("لقاء خاص"), null);
  assert.equal(parseEpisodeNumber("الحلقة 12 من السلسلة"), null);
});

test("normalizeTitle ignores hamza forms, diacritics, ta marbuta and punctuation", () => {
  assert.equal(normalizeTitle("الأخلاقُ: إصلاحٌ للقلبِ!"), normalizeTitle("الاخلاق اصلاح للقلب"));
  assert.equal(normalizeTitle("الصلاة"), normalizeTitle("الصلاه"));
});

test("parseFeed reads enclosures and durations, decoding entities and CDATA", () => {
  const xml = `<rss><channel>
    <item><title><![CDATA[وعي 5 | الصبر]]></title><itunes:duration>01:02:03</itunes:duration>
      <enclosure url="https://cdn.example.com/a.mp3?x=1&amp;y=2" type="audio/mpeg"/></item>
    <item><title>no audio</title><itunes:duration>100</itunes:duration></item>
    <item><title>insecure</title><itunes:duration>100</itunes:duration><enclosure url="http://cdn.example.com/b.mp3"/></item>
    <item><title>no duration</title><enclosure url="https://cdn.example.com/c.mp3"/></item>
  </channel></rss>`;
  const items = parseFeed(xml);
  assert.equal(items.length, 1);
  assert.deepEqual(
    { title: items[0]!.title, url: items[0]!.url, durationSeconds: items[0]!.durationSeconds, number: items[0]!.number },
    { title: "وعي 5 | الصبر", url: "https://cdn.example.com/a.mp3?x=1&y=2", durationSeconds: 3723, number: 5 },
  );
});

test("matchFeedItem matches by episode number, else by normalized title", () => {
  const items = [item("وعي 10 | الصدق", 1800), item("لقاء مع الشباب", 2400)];
  assert.equal(matchFeedItem({ title: "anything", episodeNumber: 10, durationSeconds: 1800 }, items), items[0]);
  assert.equal(matchFeedItem({ title: "وعي 10 | عنوان مختلف", episodeNumber: null, durationSeconds: 1800 }, items), items[0]);
  assert.equal(matchFeedItem({ title: "لقاءٌ مع الشباب", episodeNumber: null, durationSeconds: 2400 }, items), items[1]);
  assert.equal(matchFeedItem({ title: "حلقة غير موجودة", episodeNumber: 99, durationSeconds: 1800 }, items), null);
});

test("matchFeedItem prefers the cut whose length is closest to the video", () => {
  const short = item("وعي 30 | الرضا", 2000, "https://cdn.example.com/short.mp3");
  const full = item("وعي 30 | الرضا (كاملة)", 3590, "https://cdn.example.com/full.mp3");
  assert.equal(matchFeedItem({ title: "x", episodeNumber: 30, durationSeconds: 3600 }, [short, full]), full);
});
