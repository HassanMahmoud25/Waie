"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/server";
import { COMPLETE_THRESHOLD } from "@/lib/library/constants";
import { toEpisodeNote } from "@/lib/library/notes";
import type { EpisodeNote } from "@/types/note";

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

export type ToggleFollowedSeriesResult = { ok: true; following: boolean } | { ok: false; error: string };

/**
 * Toggles whether the signed-in user follows this series. Mirrors
 * toggleSavedEpisodeAction exactly, including the P2002 race handling --
 * see that function's comment for why. The user id always comes from the
 * server session, never a client-supplied id.
 *
 * Only a PUBLISHED series can be followed -- a draft/archived series isn't
 * reachable from the public Series page, so a request for one is either
 * stale (the series was unpublished after the button rendered) or
 * malicious, and either way should read as "not found" rather than
 * silently creating a follow row for content nobody can see.
 */
export async function toggleFollowedSeriesAction(seriesId: string): Promise<ToggleFollowedSeriesResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "سجّل الدخول لمتابعة السلاسل." };

  if (typeof seriesId !== "string" || seriesId.trim() === "") {
    return { ok: false, error: "سلسلة غير صحيحة." };
  }

  try {
    const series = await prisma.series.findFirst({ where: { id: seriesId, status: "PUBLISHED" }, select: { id: true } });
    if (!series) return { ok: false, error: "لم يتم العثور على هذه السلسلة." };

    const existing = await prisma.followedSeries.findUnique({
      where: { userId_seriesId: { userId: user.id, seriesId } },
    });

    if (existing) {
      await prisma.followedSeries.delete({ where: { userId_seriesId: { userId: user.id, seriesId } } });
      return { ok: true, following: false };
    }

    await prisma.followedSeries.create({ data: { userId: user.id, seriesId } });
    return { ok: true, following: true };
  } catch (error) {
    // Two rapid clicks (or two tabs) can race past the findUnique check above --
    // the composite primary key is the real guard. A duplicate create means it's
    // followed either way; report the true state instead of a spurious error.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: true, following: true };
    }
    console.error("toggleFollowedSeriesAction failed:", error);
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

/** No existing length cap for notes elsewhere in the codebase to reuse; chosen generously (well beyond any real note) purely to reject abuse/pathological input. */
const MAX_NOTE_LENGTH = 4000;

export type CreateNoteResult = { ok: true; note: EpisodeNote } | { ok: false; error: string };

/**
 * Creates a note for the signed-in user, anchored to a playback position in
 * one episode. The user id always comes from the server session -- never a
 * client-supplied id. Called once per explicit "حفظ الملاحظة" click (see
 * components/episode/note-composer.tsx), never per keystroke -- the
 * composer keeps its own draft in local component state and only calls this
 * on save, so there is nothing to additionally debounce here.
 */
export async function createNoteAction(episodeId: string, seconds: number, text: string): Promise<CreateNoteResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "سجّل الدخول لتدوين ملاحظاتك." };

  if (typeof episodeId !== "string" || episodeId.trim() === "") {
    return { ok: false, error: "حلقة غير صحيحة." };
  }
  const trimmed = typeof text === "string" ? text.trim() : "";
  if (!trimmed) return { ok: false, error: "اكتب نص الملاحظة." };
  if (trimmed.length > MAX_NOTE_LENGTH) return { ok: false, error: "الملاحظة طويلة جدًا." };
  const safeSeconds = Math.max(0, Math.round(Number.isFinite(seconds) ? seconds : 0));

  try {
    const episode = await prisma.episode.findUnique({ where: { id: episodeId }, select: { id: true } });
    if (!episode) return { ok: false, error: "لم يتم العثور على هذه الحلقة." };

    const row = await prisma.note.create({
      data: { userId: user.id, episodeId, seconds: safeSeconds, body: trimmed },
    });
    return { ok: true, note: toEpisodeNote(row) };
  } catch (error) {
    console.error("createNoteAction failed:", error);
    return { ok: false, error: "حدث خطأ غير متوقع." };
  }
}

export type UpdateNoteResult = { ok: true; note: EpisodeNote } | { ok: false; error: string };

/**
 * Updates a note's text and/or timestamp. Ownership is checked explicitly
 * (existing.userId !== user.id) before the write -- a user can never update
 * another user's note by guessing/passing its id, and the error message is
 * the same generic "not found" whether the note doesn't exist or simply
 * isn't theirs, so it can't be used to probe which note ids are real.
 */
export async function updateNoteAction(
  noteId: string,
  changes: { seconds?: number; text?: string },
): Promise<UpdateNoteResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "سجّل الدخول لتعديل ملاحظاتك." };
  if (typeof noteId !== "string" || noteId.trim() === "") return { ok: false, error: "ملاحظة غير صحيحة." };

  const data: { seconds?: number; body?: string } = {};
  if (changes.seconds !== undefined) {
    if (!Number.isFinite(changes.seconds)) return { ok: false, error: "توقيت غير صحيح." };
    data.seconds = Math.max(0, Math.round(changes.seconds));
  }
  if (changes.text !== undefined) {
    const trimmed = changes.text.trim();
    if (!trimmed) return { ok: false, error: "اكتب نص الملاحظة." };
    if (trimmed.length > MAX_NOTE_LENGTH) return { ok: false, error: "الملاحظة طويلة جدًا." };
    data.body = trimmed;
  }
  if (Object.keys(data).length === 0) return { ok: false, error: "لا يوجد تعديل لحفظه." };

  try {
    const existing = await prisma.note.findUnique({ where: { id: noteId }, select: { userId: true } });
    if (!existing || existing.userId !== user.id) return { ok: false, error: "لم يتم العثور على هذه الملاحظة." };

    const row = await prisma.note.update({ where: { id: noteId }, data });
    return { ok: true, note: toEpisodeNote(row) };
  } catch (error) {
    console.error("updateNoteAction failed:", error);
    return { ok: false, error: "حدث خطأ غير متوقع." };
  }
}

export type DeleteNoteResult = { ok: true } | { ok: false; error: string };

/** Same ownership check as updateNoteAction -- a user can never delete another user's note by id. */
export async function deleteNoteAction(noteId: string): Promise<DeleteNoteResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "سجّل الدخول لحذف ملاحظاتك." };
  if (typeof noteId !== "string" || noteId.trim() === "") return { ok: false, error: "ملاحظة غير صحيحة." };

  try {
    const existing = await prisma.note.findUnique({ where: { id: noteId }, select: { userId: true } });
    if (!existing || existing.userId !== user.id) return { ok: false, error: "لم يتم العثور على هذه الملاحظة." };

    await prisma.note.delete({ where: { id: noteId } });
    return { ok: true };
  } catch (error) {
    console.error("deleteNoteAction failed:", error);
    return { ok: false, error: "حدث خطأ غير متوقع." };
  }
}
