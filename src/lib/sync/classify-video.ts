import type { YouTubeVideoInfo } from "@/lib/youtube/types";

/**
 * Three-state, explainable classification -- never a silent guess. See
 * classifyVideo's doc comment for exactly how each state is reached.
 */
export type VideoClassification = "EPISODE" | "SHORT" | "UNKNOWN";

/**
 * Duration above which a video is certainly not a Short, so the network
 * probe below is skipped entirely for the common case (a normal, multi-
 * minute podcast episode). YouTube's Shorts window was historically <=60s
 * and was extended to <=3 minutes in 2024; 180s covers both without
 * over-including ordinary short-form uploads that are meaningfully longer
 * (confirmed against this project's real data in Phase 5A: every video
 * above this threshold was a genuine long-form episode).
 */
export const SHORT_CANDIDATE_MAX_DURATION_SECONDS = 180;

/**
 * Investigated in Phase 5B: the YouTube Data API's `videos.list` endpoint
 * exposes NO official signal that distinguishes a Short from a normal video
 * -- confirmed empirically against this project's own API key, across every
 * `part=` value the client already requests (snippet, contentDetails,
 * status) plus statistics/player/topicDetails. `contentDetails.dimension`
 * is "2d" for both; `player.embedHtml` is a fixed-size iframe for both;
 * there is no `isShort`/`shortsEligible` field anywhere in the response.
 *
 * The only empirically reliable signal available (validated in Phase 5A
 * against 2 known long-form controls and 13 confirmed Shorts, 15/15
 * correct) is YouTube's own routing: it serves the vertical Shorts player
 * only at /shorts/{id} for a video it currently treats as a Short, and
 * redirects everything else (normally to /watch?v={id}). This is NOT an
 * official, documented YouTube Data API contract -- it is public website
 * behavior that could change without notice, vary by network/region, or
 * simply fail (timeout, rate limiting). A failure here must never be read
 * as "not a Short" or "is a Short" -- see classifyVideo's UNKNOWN handling.
 *
 * Returns:
 *   true  - stayed on /shorts/{id}: YouTube currently serves it as a Short.
 *   false - redirected away: not currently served as a Short.
 *   null  - inconclusive (network error, timeout, non-OK response).
 */
export async function probeIsShort(videoId: string): Promise<boolean | null> {
  try {
    const response = await fetch(`https://www.youtube.com/shorts/${videoId}`, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });
    // We only need the final URL after redirects -- discard the (large) HTML body.
    await response.body?.cancel().catch(() => {});
    if (!response.ok) return null;
    return new URL(response.url).pathname.startsWith("/shorts/");
  } catch {
    return null;
  }
}

/**
 * Classifies a single video as EPISODE, SHORT, or UNKNOWN. Duration is only
 * ever used as a cheap pre-filter to skip the network probe for videos that
 * are certainly long-form -- never as the sole basis for calling something
 * a Short (see probeIsShort's doc comment for why duration alone isn't
 * trustworthy: YouTube extended the Shorts window over time, and Shorts
 * eligibility also depends on aspect ratio, which duration can't tell us).
 *
 * A candidate whose probe is inconclusive is UNKNOWN, never a guess in
 * either direction -- callers (see process-videos.ts) must never let an
 * UNKNOWN result become an accidental Episode or Short.
 */
export async function classifyVideo(
  video: Pick<YouTubeVideoInfo, "videoId" | "durationSeconds">,
): Promise<VideoClassification> {
  if (video.durationSeconds > SHORT_CANDIDATE_MAX_DURATION_SECONDS) return "EPISODE";

  const isShort = await probeIsShort(video.videoId);
  if (isShort === null) return "UNKNOWN";
  return isShort ? "SHORT" : "EPISODE";
}
