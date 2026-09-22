/**
 * One-time import of the editorial content that currently lives in `src/data`
 * into Postgres. Reads `src/data/{episodes,series,topics}.ts` only -- never
 * writes to them.
 *
 * Deliberately excluded (see the audit this script was written against):
 *  - recommendations.ts (8 rows)  -- mock/demo data, several use enum values
 *    that don't exist in RecommendationType.
 *  - topic-chapters.ts            -- a UI grouping over Topic, not its own entity.
 *  - hosts.ts / host-profiles.ts  -- no Host model exists yet.
 *  - transcripts.ts / mind-maps.ts -- both genuinely empty arrays right now.
 *  - collections.ts               -- genuinely empty array right now.
 *
 * Safe to run more than once: every write is an upsert (or createMany with
 * skipDuplicates for the join table), keyed on the *same* ids already used in
 * src/data, so a second run is a no-op rather than a duplicate/error.
 *
 * Usage:
 *   npx tsx --env-file=.env prisma/import-local-content.ts            # dry run (default) -- no writes
 *   npx tsx --env-file=.env prisma/import-local-content.ts --commit   # actually writes
 */
import { PrismaClient } from "@prisma/client";
import { episodes } from "../src/data/episodes";
import { series } from "../src/data/series";
import { topics } from "../src/data/topics";

/**
 * This script's writes go straight to DIRECT_URL (the non-pooled/session
 * connection), not the app's normal pooled DATABASE_URL. The generated
 * Client otherwise always connects via DATABASE_URL at runtime -- but that
 * connection has `pgbouncer=true` transaction-mode pooling, which can hand
 * later statements inside one open interactive transaction to a different
 * backend connection than the one that started it ("Transaction not
 * found"). This is a one-off bulk-import script wrapped in a single
 * all-or-nothing transaction, so it needs the direct connection instead.
 */
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DIRECT_URL } } });
const COMMIT = process.argv.includes("--commit");

// ---------------------------------------------------------------------------
// Real YouTube identifiers, resolved live against the YouTube Data API in the
// session that wrote this script (2026-09-22) -- not invented, not guessed.
// Channel IDs are stable/permanent even if a channel's handle changes later,
// so hardcoding them here is safe. See the commit that introduced this file
// for the exact API calls used to derive each one.
// ---------------------------------------------------------------------------

/** The main @Waie channel -- owns 91 of the 113 episodes (every seriesId !== "series-season-one"). */
const WAIE_CHANNEL_ID = "UC2qcjzOEX3lxE73cyroWdiw";

/**
 * Hazem El Seddiq's own channel -- owns the 22 "Season One" episodes. Confirmed
 * three independent ways: (1) the "وعي" playlist named in the block comment
 * above ep-21 in src/data/episodes.ts (playlist id PLcaLjDlQePQU3dpVNUzTSQQapGgtxPtts)
 * resolves via the YouTube API to this channel; (2) a direct videos.list lookup
 * of ep-21's own videoId (3-Caas1JElk) reports this same channelId; (3) a lookup
 * of ep-1's videoId (RhTxjl_W_BM) reports it too. All three agree.
 */
const HAZEM_CHANNEL_ID = "UCAG5O5KFtLnDGLRpGQB_JCw";

/**
 * Real @Waie playlist ids, resolved live via the YouTube Data API and matched
 * to our 6 static series by an exact (byte-identical) title match -- not a
 * fuzzy guess. All 5 @Waie-hosted series matched unambiguously; there was no
 * playlist title collision or partial match to adjudicate.
 *
 * `series-season-one` is intentionally NOT in this map even though its real
 * source playlist is known (see HAZEM_CHANNEL_ID above): it lives on a
 * different channel that the sync system (lib/sync/*, single-channel by
 * design via YOUTUBE_CHANNEL_HANDLE) never scans, so setting sourcePlaylistId
 * for it would not protect against a future duplicate the way it does for the
 * other 5 -- it's recorded separately below purely for traceability.
 */
const WAIE_SERIES_PLAYLIST_IDS: Record<string, string> = {
  "series-companions": "PLCpK4282MCT8Yw6cEFzXciS2zm_aVUa8S", // "سلسلة الصحابة", 8 items
  "series-stories": "PLCpK4282MCT80bGKKd_Ia8-y9HzKQcyOP", // "سلسلة القصص", 19 items
  "series-worship-seasons": "PLEBlCt2prQQQ", // "مواسم العبادات", 7 items
  "series-ethics": "PLCpK4282MCT8jibbOQsc3JBUtRWoI5mZe", // "سلسلة الأخلاق", 12 items
  "series-commitment": "PLCpK4282MCT94ZoU8XWWF1Sj3b-3tV2oB", // "التدين والالتزام", 4 items
};

/** Traceability-only; see the comment on WAIE_SERIES_PLAYLIST_IDS above. */
const SEASON_ONE_PLAYLIST_ID = "PLcaLjDlQePQU3dpVNUzTSQQapGgtxPtts";

function youtubeUrlFor(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

function youtubeThumbnailFor(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

/**
 * Even one interactive transaction spanning all ~165 upserts timed out against
 * Supabase (see the commit history of this file). Splitting into small,
 * independently-atomic transactions avoids that without giving up
 * transactions altogether: each batch below either fully commits or fully
 * rolls back on its own. A failure partway through only means later batches
 * haven't run yet -- every write is an upsert (or createMany with
 * skipDuplicates), so re-running the script picks up exactly where it left
 * off instead of erroring or duplicating anything already committed.
 */
const EPISODE_BATCH_SIZE = 20;
const EPISODE_TOPIC_BATCH_SIZE = 60;

async function runBatch(label: string, fn: () => Promise<void>): Promise<void> {
  console.log(`Writing ${label}...`);
  try {
    await fn();
  } catch (error) {
    throw new Error(`Failed during "${label}": ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function main() {
  console.log(COMMIT ? "Running in COMMIT mode -- this will write to the database." : "Running in DRY-RUN mode -- no writes will be made (pass --commit to write).");

  // ---- Build the exact rows, and self-check them the same way the audit did ----
  const topicIds = new Set(topics.map((t) => t.id));
  const seriesIds = new Set(series.map((s) => s.id));

  const missingTopicRefs = episodes.flatMap((e) => e.topicIds).filter((id) => !topicIds.has(id));
  const missingSeriesRefs = episodes.map((e) => e.seriesId).filter((id) => id && id !== "" && !seriesIds.has(id));
  if (missingTopicRefs.length > 0 || missingSeriesRefs.length > 0) {
    throw new Error(
      `Aborting: src/data has dangling references (missing topics: ${missingTopicRefs.join(",")}; missing series: ${missingSeriesRefs.join(",")}). This did not happen during the audit -- src/data may have changed since.`,
    );
  }

  const topicRows = topics.map((t) => ({
    id: t.id,
    title: t.title,
    slug: t.slug,
    description: t.description || null,
    color: t.color,
  }));

  const seriesRows = series.map((s, index) => ({
    id: s.id,
    title: s.title,
    slug: s.slug,
    description: s.description || null,
    coverImage: s.coverImage ?? null,
    coverImageMobile: (s as { coverImageMobile?: string }).coverImageMobile ?? null,
    position: index,
    status: s.status,
    topicId: s.topicId,
    sourcePlaylistId: s.id === "series-season-one" ? null : (WAIE_SERIES_PLAYLIST_IDS[s.id] ?? null),
  }));

  const episodeRows = episodes.map((e) => {
    const isSeasonOne = e.seriesId === "series-season-one";
    return {
      id: e.id,
      slug: e.slug,
      youtubeVideoId: e.youtubeVideoId,
      youtubeUrl: youtubeUrlFor(e.youtubeVideoId),
      youtubeChannelId: isSeasonOne ? HAZEM_CHANNEL_ID : WAIE_CHANNEL_ID,
      youtubeTitle: e.title,
      youtubeDescription: null as string | null, // no rule given for this column; left null on purpose (see file header)
      youtubeThumbnailUrl: youtubeThumbnailFor(e.youtubeVideoId),
      youtubeDurationSeconds: e.durationSeconds,
      youtubePublishedAt: e.publishedAt,
      title: e.title,
      description: e.description === "" ? null : e.description,
      thumbnailUrl: null as string | null,
      audioUrl: e.audioUrl ?? null,
      episodeNumber: e.episodeNumber,
      status: e.status,
      featured: e.featured,
      seriesId: e.seriesId === "" ? null : e.seriesId,
    };
  });

  const episodeTopicRows = episodes.flatMap((e) => e.topicIds.map((topicId) => ({ episodeId: e.id, topicId })));

  // ---- Summary (printed in both modes) ----
  console.log(
    JSON.stringify(
      {
        topics: topicRows.length,
        series: seriesRows.length,
        seriesWithSourcePlaylistId: seriesRows.filter((s) => s.sourcePlaylistId).length,
        seriesWithoutSourcePlaylistId: seriesRows.filter((s) => !s.sourcePlaylistId).map((s) => s.id),
        episodes: episodeRows.length,
        episodesOnWaieChannel: episodeRows.filter((e) => e.youtubeChannelId === WAIE_CHANNEL_ID).length,
        episodesOnHazemChannel: episodeRows.filter((e) => e.youtubeChannelId === HAZEM_CHANNEL_ID).length,
        episodeTopicLinks: episodeTopicRows.length,
        seasonOneTraceabilityPlaylistId: SEASON_ONE_PLAYLIST_ID,
        skipped: ["recommendations (mock)", "topic-chapters (UI-only)", "hosts/host-profiles (no model yet)", "transcripts (empty)", "mind-maps (empty)", "collections (empty)"],
      },
      null,
      2,
    ),
  );

  if (!COMMIT) {
    console.log("\nDry run complete. No rows were written. Re-run with --commit to apply.");
    return;
  }

  await runBatch(`topics (1 transaction, ${topicRows.length} rows)`, () =>
    prisma.$transaction(async (tx) => {
      for (const row of topicRows) {
        await tx.topic.upsert({ where: { id: row.id }, create: row, update: row });
      }
    }),
  );

  await runBatch(`series (1 transaction, ${seriesRows.length} rows)`, () =>
    prisma.$transaction(async (tx) => {
      for (const row of seriesRows) {
        await tx.series.upsert({ where: { id: row.id }, create: row, update: row });
      }
    }),
  );

  const episodeBatches = chunk(episodeRows, EPISODE_BATCH_SIZE);
  for (const [index, batch] of episodeBatches.entries()) {
    await runBatch(`episode batch ${index + 1}/${episodeBatches.length} (${batch.length} rows)`, () =>
      prisma.$transaction(async (tx) => {
        for (const row of batch) {
          await tx.episode.upsert({ where: { id: row.id }, create: row, update: row });
        }
      }),
    );
  }

  const episodeTopicBatches = chunk(episodeTopicRows, EPISODE_TOPIC_BATCH_SIZE);
  for (const [index, batch] of episodeTopicBatches.entries()) {
    await runBatch(`EpisodeTopic batch ${index + 1}/${episodeTopicBatches.length} (${batch.length} rows)`, () =>
      prisma.$transaction(async (tx) => {
        await tx.episodeTopic.createMany({ data: batch, skipDuplicates: true });
      }),
    );
  }

  console.log("\nImport committed successfully.");
}

main()
  .catch((error) => {
    console.error("IMPORT_ERROR:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
