#!/usr/bin/env bash
#
# Copies production CONTENT into the local development database:
#
#   npm run db:pull-content
#
# Production is only ever read: the export is a `pg_dump --data-only`, which
# runs inside a single REPEATABLE READ, READ ONLY transaction (one consistent
# snapshot that cannot write), and the count check runs in BEGIN READ ONLY.
#
# Copied (content only): see CONTENT_TABLES below.
# Never copied: User, PasswordResetToken, WatchProgress, SavedEpisode,
# FollowedSeries, Note, Notification, SyncRun, _prisma_migrations, and every
# non-public Supabase schema. Local accounts stay completely independent.
#
# The local load is one all-or-nothing transaction: the 14 local content
# tables are emptied and refilled, so re-running simply refreshes them. FK
# triggers are paused inside that transaction (session_replication_role), so
# emptying content does not cascade into local users' saves/progress/notes;
# afterwards, only local rows pointing at content that no longer exists are
# removed, and every foreign key is re-checked before committing.
#
# Requires: PostgreSQL 17 client tools (Homebrew postgresql@17), node, the
# production URL in .env.supabase.local (DIRECT_URL, the session pooler), and
# a localhost DATABASE_URL in .env.local / .env.
set -euo pipefail

cd "$(dirname "$0")/.."

CONTENT_TABLES=(
  Topic Series Episode EpisodeTopic Person EpisodeParticipant Short
  Transcript Recommendation MindMap Collection CollectionItem
  YouTubeChannel Playlist
)
# Children first, so the DELETE order reads naturally (FK triggers are paused anyway).
DELETE_ORDER=(
  CollectionItem EpisodeTopic EpisodeParticipant Transcript Recommendation MindMap
  Episode Series Topic Person Collection Short Playlist YouTubeChannel
)

fail() { echo "✖ $*" >&2; exit 1; }

# --- PostgreSQL client tools ---------------------------------------------------
PG_BIN="${PG_BIN:-/opt/homebrew/opt/postgresql@17/bin}"
if [[ -x "$PG_BIN/pg_dump" ]]; then
  PG_DUMP="$PG_BIN/pg_dump"; PSQL="$PG_BIN/psql"
else
  PG_DUMP="$(command -v pg_dump || true)"; PSQL="$(command -v psql || true)"
fi
[[ -n "$PG_DUMP" && -n "$PSQL" ]] || fail "pg_dump/psql not found -- brew install postgresql@17 (or set PG_BIN)."

# --- Connection strings (never printed) ----------------------------------------
# Reads KEY from FILE and prints a libpq-safe URL: user/password percent-encoded
# (Prisma tolerates a raw "@" in a password, libpq does not) and Prisma-only
# query parameters (pgbouncer, schema, ...) dropped.
libpq_url() {
  node -e '
    const [file, key] = process.argv.slice(1);
    let text = "";
    try { text = require("fs").readFileSync(file, "utf8"); } catch { process.exit(0); }
    const line = text.match(new RegExp("^" + key + "=\"?([^\"\\n]+)\"?\\s*$", "m"));
    if (!line) process.exit(0);
    const m = line[1].split("?")[0].match(/^(postgres(?:ql)?:\/\/)(?:([^:@]+)(?::(.*))?@)?([^@]+)$/);
    if (!m) process.exit(0);
    const auth = m[2] ? encodeURIComponent(decodeURIComponent(m[2])) + (m[3] !== undefined ? ":" + encodeURIComponent(m[3]) : "") + "@" : "";
    process.stdout.write(m[1] + auth + m[4]);
  ' "$1" "$2"
}
host_of() { node -e 'process.stdout.write(new URL(process.argv[1]).hostname)' "$1"; }

SOURCE_URL="$(libpq_url .env.supabase.local DIRECT_URL)"
[[ -n "$SOURCE_URL" ]] || fail ".env.supabase.local has no DIRECT_URL (the Supabase session-pooler URL)."

TARGET_URL="$(libpq_url .env.local DATABASE_URL)"
[[ -n "$TARGET_URL" ]] || TARGET_URL="$(libpq_url .env DATABASE_URL)"
[[ -n "$TARGET_URL" ]] || fail "No DATABASE_URL in .env.local or .env."

SOURCE_HOST="$(host_of "$SOURCE_URL")"
TARGET_HOST="$(host_of "$TARGET_URL")"
case "$TARGET_HOST" in
  localhost | 127.0.0.1 | "[::1]" | ::1) ;;
  *) fail "Refusing to write: local DATABASE_URL points at '$TARGET_HOST', not localhost." ;;
esac
case "$SOURCE_HOST" in
  localhost | 127.0.0.1 | "[::1]" | ::1) fail "DIRECT_URL in .env.supabase.local points at localhost -- that's not production." ;;
esac

echo "Production (read-only): $SOURCE_HOST"
echo "Local target:           $TARGET_HOST/$(node -e 'process.stdout.write(new URL(process.argv[1]).pathname.slice(1))' "$TARGET_URL")"

[[ "$("$PSQL" "$TARGET_URL" -X -tA -c 'select rolsuper from pg_roles where rolname = current_user')" == "t" ]] ||
  fail "The local role must be a superuser (needed to pause FK triggers during the load)."

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# --- 1. Export from production (read-only snapshot) ----------------------------
table_args=()
for t in "${CONTENT_TABLES[@]}"; do table_args+=("--table=public.\"$t\""); done

echo "Exporting ${#CONTENT_TABLES[@]} content tables from production…"
"$PG_DUMP" "$SOURCE_URL" --data-only --no-owner --no-privileges "${table_args[@]}" --file="$WORK/content.sql"

# --- 2. Check the export contains exactly the expected tables -------------------
dumped="$(grep -oE '^COPY public\."[A-Za-z]+"' "$WORK/content.sql" | sed -E 's/^COPY public\."([A-Za-z]+)"/\1/' | sort)"
expected="$(printf '%s\n' "${CONTENT_TABLES[@]}" | sort)"
[[ "$dumped" == "$expected" ]] || fail "Export doesn't contain exactly the expected tables -- nothing was loaded.
expected: $(echo $expected)
got:      $(echo $dumped)"

# --- 3. Load into local, all-or-nothing -----------------------------------------
{
  echo "SET LOCAL session_replication_role = replica;"
  for t in "${DELETE_ORDER[@]}"; do echo "DELETE FROM public.\"$t\";"; done
  echo "\\i $WORK/content.sql"
  echo "SET LOCAL session_replication_role = origin;"
  # Local per-user rows whose content no longer exists (FK cascades were paused above).
  cat <<'SQL'
DELETE FROM public."WatchProgress" w WHERE NOT EXISTS (SELECT 1 FROM public."Episode" e WHERE e.id = w."episodeId");
DELETE FROM public."SavedEpisode" s WHERE NOT EXISTS (SELECT 1 FROM public."Episode" e WHERE e.id = s."episodeId");
DELETE FROM public."Note" n WHERE NOT EXISTS (SELECT 1 FROM public."Episode" e WHERE e.id = n."episodeId");
DELETE FROM public."Notification" n WHERE n."episodeId" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public."Episode" e WHERE e.id = n."episodeId");
DELETE FROM public."FollowedSeries" f WHERE NOT EXISTS (SELECT 1 FROM public."Series" s WHERE s.id = f."seriesId");
-- FK triggers were paused for the load: re-check every foreign key in the schema before committing.
DO $$
DECLARE c record; bad bigint;
BEGIN
  FOR c IN
    SELECT con.conrelid::regclass AS child, ca.attname AS child_col,
           con.confrelid::regclass AS parent, pa.attname AS parent_col
    FROM pg_constraint con
    JOIN pg_attribute ca ON ca.attrelid = con.conrelid AND ca.attnum = con.conkey[1]
    JOIN pg_attribute pa ON pa.attrelid = con.confrelid AND pa.attnum = con.confkey[1]
    WHERE con.contype = 'f' AND con.connamespace = 'public'::regnamespace AND cardinality(con.conkey) = 1
  LOOP
    EXECUTE format('SELECT count(*) FROM %s x WHERE x.%I IS NOT NULL AND NOT EXISTS (SELECT 1 FROM %s p WHERE p.%I = x.%I)',
                   c.child, c.child_col, c.parent, c.parent_col, c.child_col) INTO bad;
    IF bad > 0 THEN
      RAISE EXCEPTION 'Foreign key check failed: % row(s) in %.% have no matching %.%', bad, c.child, c.child_col, c.parent, c.parent_col;
    END IF;
  END LOOP;
END $$;
SQL
} > "$WORK/load.sql"

echo "Loading into local (single transaction)…"
"$PSQL" "$TARGET_URL" -X -q -v ON_ERROR_STOP=1 --single-transaction -f "$WORK/load.sql" > /dev/null

# --- 4. Compare row counts ------------------------------------------------------
count_sql="$(for t in "${CONTENT_TABLES[@]}"; do printf "SELECT '%s', count(*) FROM public.\"%s\" UNION ALL " "$t" "$t"; done | sed 's/ UNION ALL $//')"
prod_counts="$("$PSQL" "$SOURCE_URL" -X -tA -F ' ' -c "BEGIN READ ONLY" -c "$count_sql" -c "COMMIT" | grep -vE '^(BEGIN|COMMIT)$')"
local_counts="$("$PSQL" "$TARGET_URL" -X -tA -F ' ' -c "$count_sql")"

echo
printf '%-20s %10s %10s\n' "table" "production" "local"
mismatch=0
while read -r table prod; do
  local_n="$(awk -v t="$table" '$1 == t { print $2 }' <<< "$local_counts")"
  flag=""; [[ "$prod" == "$local_n" ]] || { flag="  ← differs"; mismatch=1; }
  printf '%-20s %10s %10s%s\n' "$table" "$prod" "$local_n" "$flag"
done <<< "$prod_counts"

echo
if [[ $mismatch -eq 0 ]]; then
  echo "✔ Local content matches production."
else
  fail "Counts differ -- production may have changed during the copy; run it again."
fi
