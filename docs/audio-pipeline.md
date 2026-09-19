# Audio (Listen mode)

Every episode can be watched (the YouTube embed) or listened to (an MP3). This page
explains where the audio comes from and why. The player side lives in
`src/lib/playback/` and `src/components/media/`.

## Where the audio comes from

**Waie's own podcast feed.** Each episode published as a YouTube video is also published
as a podcast episode -- the same recording as a plain MP3 -- to Apple Podcasts / Spotify /
SoundCloud, all fed by one public RSS feed
(`https://feeds.soundcloud.com/users/soundcloud:users:1073536591/sounds.rss`, 128 kbps MP3,
≈ 63 MB for a 65-minute episode). That is the audio "already inside the video", published
by its owner, so there is nothing to prepare or upload and nothing extra in the content model.

`src/lib/audio/podcast-feed.ts` (server-only) reads the feed (cached for an hour, 4 s timeout,
never fatal) and pairs each episode with its item:

1. **Same episode**: same number (`وعي 111`) or same normalised title.
2. **Same recording**: lengths agree to within 5 s (`MAX_DURATION_DRIFT_SECONDS`).

Step 2 is what makes the pairing safe. Video ↔ Audio switching carries the playback position
across, which is only honest if both are the same edit. Where the podcast cut differs (trimmed or
extended by minutes) the episode stays watch-only rather than land the listener at the wrong
moment; the feed also reuses a number or two, which the length check disambiguates.

Result today: 100 of 113 episodes pair; the rest are episodes with no podcast counterpart (clips,
the separate season-one channel) or a different cut. Those show Listen dimmed with
«النسخة الصوتية لهذه الحلقة قيد الإعداد» and behave exactly as watch-only.

New episodes pick up their audio automatically once the podcast publishes them.

### Overrides

`Episode.audioUrl` (nullable; edit it at `/admin/episodes/<id>`) always wins over the feed. Use it for
an episode the podcast doesn't carry or carries in a different cut. The form only accepts `https://`
URLs or `/paths`, and rejects YouTube hosts. `audio:encode` (below) can produce files for those.

Config: `PODCAST_FEED_URL` (default: the feed above; empty string turns Listen off entirely).

## Why not the video's own audio track?

The videos are YouTube embeds, and YouTube exposes no way to use only their audio:

- The IFrame Player API has no audio-only mode or audio-track selection (its `player` object
  only exposes quality getters/setters), and `setPlaybackQuality` is ignored -- an embed
  that chose 720p stayed at 720p after `setPlaybackQuality("tiny")`.
- The embed is a cross-origin iframe: the page can't see or steer what it downloads.
- Hiding the iframe (`display: none`) doesn't stop the video stream, and YouTube's developer policies
  forbid background/hidden playback of the embed, separating a video's audio, and caching or
  downloading its content. Extracting the audio server-side (yt-dlp and similar) is the same
  prohibited thing, and is brittle besides (signed, expiring, IP-bound stream URLs).

So audio is never taken from YouTube. The podcast feed is the owner-published equivalent.

## Bandwidth

Audio mode is a real saving, not a visual trick:

- Listen mode never loads the YouTube embed at all: no iframe, no `iframe_api`, no player JS
  (verified: a fresh load with Listen as the saved choice makes zero requests to youtube.com).
  Switching Video → Audio removes the iframe, which ends the video download.
- The MP3 is fetched only when someone presses play, as HTTP range requests
  (`preload="metadata"` fetches just the header). The enclosure URL redirects to a signed CDN URL and
  supports `Range`/`206`, so seeking doesn't re-download.
- 128 kbps audio, versus video at the 720p the embed picked on its own (typically a multiple of that; the
  embed's actual bytes can't be observed from the page, so no exact ratio is claimed).

## Files you produce yourself (fallback)

Only needed for episodes the feed doesn't cover. `npm run audio:encode -- <masters-dir>` re-encodes
Waie's own master recordings to AAC `.m4a` (`-movflags +faststart` so seeking works over range
requests), writes `manifest.json`, and with `--base-url` an `attach.sql` that sets `audioUrl` (file name =
episode slug). Host them on any object store/CDN that supports `Range`, with
`Content-Type: audio/mp4` and `Cache-Control: public, max-age=31536000, immutable` (replace a file by
uploading a new name). Keep the full length -- no trimmed intros -- so the timelines match the video.

## Player behaviour that depends on this

- Playback state (position, mode) is restored after a refresh but never auto-started.
- If the audio fails to load, the player says so and offers to switch to video at the same position.
