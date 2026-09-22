"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/server";
import {
  runImportFullChannel,
  runSyncNewVideos,
  runSyncMetadata,
  runSyncPlaylists,
  type SyncResult,
} from "@/lib/sync";

export type SyncActionState = { result?: SyncResult; error?: string };

function isConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.YOUTUBE_API_KEY);
}

async function run(operation: () => Promise<SyncResult>): Promise<SyncActionState> {
  // Server actions are public POST endpoints -- every one must authorize itself.
  await requireAdmin();

  if (!isConfigured()) {
    return {
      error: "أضف YOUTUBE_API_KEY و DATABASE_URL في .env.local قبل تشغيل المزامنة.",
    };
  }

  try {
    const result = await operation();
    revalidatePath("/admin/sync/youtube");
    revalidatePath("/");
    return { result };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "حدث خطأ غير متوقع أثناء المزامنة." };
  }
}

export async function importFullChannelAction(): Promise<SyncActionState> {
  return run(runImportFullChannel);
}

export async function syncNewVideosAction(): Promise<SyncActionState> {
  return run(runSyncNewVideos);
}

export async function syncMetadataAction(): Promise<SyncActionState> {
  return run(runSyncMetadata);
}

export async function syncPlaylistsAction(): Promise<SyncActionState> {
  return run(runSyncPlaylists);
}
