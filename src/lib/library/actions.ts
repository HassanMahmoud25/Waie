"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/server";
import { COMPLETE_THRESHOLD } from "@/lib/library/constants";

export type ToggleSavedEpisodeResult = { ok: true; saved: boolean } | { ok: false; error: string };

/**
 * Toggles whether the signed-in user has saved this episode. The user id
 * always comes from the server session (getSessionUser) -- the client only
 * ever sends the episodeId, never a userId, so there is no way to save or
 * unsave on another account's behalf.
 *
 * Idempotent by construction: SavedEpisode's composite @@id([userId,
 * episodeId]) is the actual uniqueness guarantee, not just this function's
 * own read-then-write logic -- see the P2002 handling below for the race
 * between two rapid clicks.
 */
export async function toggleSavedEpisodeAction(episodeId: string): Promise<ToggleSavedEpisodeResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "سجّل الدخول لحفظ الحلقات." };

  if (typeof episodeId !== "string" || episodeId.trim() === "") {
    return { ok: false, error: "حلقة غير صحيحة." };
  }

  try {
    const episode = await prisma.episode.findUnique({ where: { id: episodeId }, select: { id: true } });
    if (!episode) return { ok: false, error: "لم يتم العثور على هذه الحلقة." };

    const existing = await prisma.savedEpisode.findUnique({
      where: { userId_episodeId: { userId: user.id, episodeId } },
    });

    if (existing) {
      await prisma.savedEpisode.delete({ where: { userId_episodeId: { userId: user.id, episodeId } } });
      return { ok: true, saved: false };
    }

    await prisma.savedEpisode.create({ data: { userId: user.id, episodeId } });
    return { ok: true, saved: true };
  } catch (error) {
    // Two rapid clicks (or two tabs) can race past the findUnique check above --
    // the composite primary key is the real guard. A duplicate create means it's
    // saved either way; report the true state instead of a spurious error.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: true, saved: true };
    }
    console.error("toggleSavedEpisodeAction failed:", error);
    return { ok: false, error: "حدث خطأ غير متوقع." };
  }
}

export type SetEpisodeProgressResult = { ok: true } | { ok: false; error: string };

/**
 * Upserts the signed-in user's watch progress for one episode. The user id
 * always comes from the server session -- never a client-supplied id.
 *
 * Deliberately fire-and-forget from the caller's perspective (see
 * lib/library/progress-store.ts): the player engine already throttles how
 * often progress is reported (at most once per ~5s, plus discrete pause/seek/
 * ended/visibility events -- see PROGRESS_SAVE_INTERVAL_MS in
 * lib/playback/engine.ts), so this function does not add a second debounce
 * layer of its own.
 *
 * `completed` only ever turns on here when crossing COMPLETE_THRESHOLD --
 * never off, so a plain progress update can never undo a manual "mark as
 * watched" (or an earlier completion). Un-marking is only ever done by
 * toggleEpisodeCompletedAction below.
 */
export async function setEpisodeProgressAction(
  episodeId: string,
  seconds: number,
  durationSeconds: number,
): Promise<SetEpisodeProgressResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "سجّل الدخول لحفظ تقدّمك." };
  if (typeof episodeId !== "string" || episodeId.trim() === "") {
    return { ok: false, error: "حلقة غير صحيحة." };
  }

  const safeSeconds = Math.max(0, Math.round(seconds));
  const safeDuration = Math.max(0, Math.round(durationSeconds));

  try {
    const episode = await prisma.episode.findUnique({ where: { id: episodeId }, select: { id: true } });
    if (!episode) return { ok: false, error: "لم يتم العثور على هذه الحلقة." };

    const existing = await prisma.watchProgress.findUnique({
      where: { userId_episodeId: { userId: user.id, episodeId } },
      select: { completed: true },
    });
    const completed = (existing?.completed ?? false) || (safeDuration > 0 && safeSeconds / safeDuration >= COMPLETE_THRESHOLD);

    await prisma.watchProgress.upsert({
      where: { userId_episodeId: { userId: user.id, episodeId } },
      create: { userId: user.id, episodeId, seconds: safeSeconds, duration: safeDuration, completed },
      update: { seconds: safeSeconds, duration: safeDuration, completed },
    });
    return { ok: true };
  } catch (error) {
    console.error("setEpisodeProgressAction failed:", error);
    return { ok: false, error: "حدث خطأ غير متوقع." };
  }
}

export type ToggleEpisodeCompletedResult = { ok: true; completed: boolean } | { ok: false; error: string };

/**
 * Manually toggles completion, independent of playback position -- this is
 * the one path that CAN turn `completed` back off (the "أنهيت الحلقة؟"
 * button), unlike setEpisodeProgressAction's one-way auto-completion.
 */
export async function toggleEpisodeCompletedAction(episodeId: string): Promise<ToggleEpisodeCompletedResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "سجّل الدخول لتسجيل إنهاء الحلقة." };
  if (typeof episodeId !== "string" || episodeId.trim() === "") {
    return { ok: false, error: "حلقة غير صحيحة." };
  }

  try {
    const episode = await prisma.episode.findUnique({ where: { id: episodeId }, select: { id: true } });
    if (!episode) return { ok: false, error: "لم يتم العثور على هذه الحلقة." };

    const existing = await prisma.watchProgress.findUnique({
      where: { userId_episodeId: { userId: user.id, episodeId } },
    });
    const nextCompleted = !existing?.completed;

    await prisma.watchProgress.upsert({
      where: { userId_episodeId: { userId: user.id, episodeId } },
      create: {
        userId: user.id,
        episodeId,
        seconds: existing?.seconds ?? 0,
        duration: existing?.duration ?? 0,
        completed: nextCompleted,
      },
      update: { completed: nextCompleted },
    });
    return { ok: true, completed: nextCompleted };
  } catch (error) {
    console.error("toggleEpisodeCompletedAction failed:", error);
    return { ok: false, error: "حدث خطأ غير متوقع." };
  }
}
