#!/usr/bin/env node
// Encodes audio-only versions of Waie's own master recordings (see docs/audio-pipeline.md).
//
//   npm run audio:encode -- <masters-dir> [--out out] [--bitrate 96k] [--mono]
//                                          [--base-url https://cdn.example.com/episodes] [--force]
//
// Each file's name (without extension) must be the episode's slug: waie-111.mp4 -> waie-111.m4a.
// Requires ffmpeg and ffprobe. Never point this at anything downloaded from YouTube.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";

const MEDIA_EXTENSIONS = new Set([".mp4", ".mov", ".mkv", ".m4v", ".webm", ".wav", ".flac", ".mp3", ".m4a", ".aac"]);

function parseArgs(argv) {
  const options = { out: "out", bitrate: "96k", mono: false, force: false, baseUrl: null, input: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--out") options.out = argv[++i];
    else if (arg === "--bitrate") options.bitrate = argv[++i];
    else if (arg === "--base-url") options.baseUrl = argv[++i].replace(/\/+$/, "");
    else if (arg === "--mono") options.mono = true;
    else if (arg === "--force") options.force = true;
    else if (arg.startsWith("--")) fail(`Unknown option ${arg}`);
    else if (!options.input) options.input = arg;
    else fail(`Unexpected argument ${arg}`);
  }
  if (!options.input) fail("Usage: audio:encode <masters-dir> [--out out] [--bitrate 96k] [--mono] [--base-url URL] [--force]");
  return options;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.error?.code === "ENOENT") fail(`${command} not found. Install ffmpeg (which includes ffprobe) and try again.`);
  return result;
}

function durationSeconds(file) {
  const result = run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", file]);
  const value = Number.parseFloat(result.stdout);
  return Number.isFinite(value) ? Math.round(value) : null;
}

const options = parseArgs(process.argv.slice(2));
const inputDir = resolve(options.input);
const outDir = resolve(options.out);
if (!existsSync(inputDir)) fail(`Masters directory not found: ${inputDir}`);
mkdirSync(outDir, { recursive: true });

const masters = readdirSync(inputDir)
  .filter((name) => MEDIA_EXTENSIONS.has(extname(name).toLowerCase()) && !name.startsWith("."))
  .sort();
if (masters.length === 0) fail(`No media files found in ${inputDir}`);

const manifest = [];
let failures = 0;

for (const name of masters) {
  const slug = basename(name, extname(name));
  const source = join(inputDir, name);
  const target = join(outDir, `${slug}.m4a`);

  if (existsSync(target) && !options.force) {
    console.log(`skip    ${slug} (already encoded; --force to redo)`);
  } else {
    const args = ["-y", "-v", "error", "-i", source, "-vn", "-map", "0:a:0", "-map_metadata", "-1", "-c:a", "aac", "-b:a", options.bitrate];
    if (options.mono) args.push("-ac", "1");
    args.push("-movflags", "+faststart", target);
    const result = run("ffmpeg", args);
    if (result.status !== 0) {
      console.error(`FAILED  ${slug}\n${result.stderr}`);
      failures++;
      continue;
    }
    console.log(`encoded ${slug}`);
  }

  manifest.push({ slug, file: `${slug}.m4a`, durationSeconds: durationSeconds(target) });
}

writeFileSync(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

if (options.baseUrl) {
  const escape = (value) => value.replace(/'/g, "''");
  const statements = manifest.map(
    ({ slug, file }) => `UPDATE "Episode" SET "audioUrl" = '${escape(`${options.baseUrl}/${file}`)}' WHERE "slug" = '${escape(slug)}';`,
  );
  writeFileSync(join(outDir, "attach.sql"), statements.join("\n") + "\n");
  console.log(`\nWrote ${join(outDir, "attach.sql")} -- review it, upload the .m4a files, then run it.`);
}

console.log(`\n${manifest.length} file(s) in ${outDir}${failures ? `, ${failures} failed` : ""}.`);
process.exit(failures ? 1 : 0);
