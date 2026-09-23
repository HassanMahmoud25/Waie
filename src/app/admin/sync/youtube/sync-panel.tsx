"use client";

import { useState, useTransition, type ComponentType } from "react";
import { Download, RefreshCw, FileText, ListVideo, Loader2, CircleCheck, CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SyncActionState } from "./actions";
import { importFullChannelAction, syncNewVideosAction, syncMetadataAction, syncPlaylistsAction } from "./actions";

type OperationKey = "full" | "new" | "metadata" | "playlists";

type Operation = {
  key: OperationKey;
  title: string;
  description: string;
  icon: ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }>;
  action: () => Promise<SyncActionState>;
};

const operations: Operation[] = [
  {
    key: "full",
    title: "استيراد القناة كاملة",
    description: "يجلب كل الحلقات المنشورة على القناة ويكتشف قوائم التشغيل كسلاسل. آمن للتشغيل أكثر من مرة.",
    icon: Download,
    action: importFullChannelAction,
  },
  {
    key: "new",
    title: "مزامنة الحلقات الجديدة",
    description: "يكتشف الحلقات المنشورة حديثًا فقط، دون إعادة فحص الأرشيف كاملًا.",
    icon: ListVideo,
    action: syncNewVideosAction,
  },
  {
    key: "metadata",
    title: "تحديث البيانات الوصفية",
    description: "يحدّث العنوان والوصف والصورة والمدة الأصلية من يوتيوب لكل حلقة مستوردة، دون لمس أي تعديل تحريري.",
    icon: RefreshCw,
    action: syncMetadataAction,
  },
  {
    key: "playlists",
    title: "مزامنة قوائم التشغيل",
    description: "يكتشف قوائم تشغيل جديدة وينشئ سلاسل لها، ويضم إليها الحلقات غير المصنَّفة بعد فقط.",
    icon: FileText,
    action: syncPlaylistsAction,
  },
];

/** The four sync actions from the spec, each with its own loading/result/error state. */
export function SyncPanel() {
  const [pendingKey, setPendingKey] = useState<OperationKey | null>(null);
  const [results, setResults] = useState<Partial<Record<OperationKey, SyncActionState>>>({});
  const [isPending, startTransition] = useTransition();

  function run(operation: Operation) {
    setPendingKey(operation.key);
    startTransition(async () => {
      const result = await operation.action();
      setResults((prev) => ({ ...prev, [operation.key]: result }));
      setPendingKey(null);
    });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {operations.map((operation) => {
        const state = results[operation.key];
        const isRunning = isPending && pendingKey === operation.key;
        const Icon = operation.icon;

        return (
          <div key={operation.key} className="admin-panel flex flex-col gap-5 p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <span className="admin-tile">
                <Icon size={20} aria-hidden />
              </span>
              <div className="min-w-0">
                <h3 className="text-base font-black leading-[1.8]">{operation.title}</h3>
                <p className="mt-1 text-sm leading-7 text-[var(--ink-soft)]">{operation.description}</p>
              </div>
            </div>

            <Button
              variant="secondary"
              className="mt-auto w-full sm:w-fit"
              onClick={() => run(operation)}
              disabled={isPending}
              icon={isRunning ? <Loader2 className="animate-spin" size={16} aria-hidden /> : undefined}
              iconPosition="start"
              aria-busy={isRunning}
            >
              {isRunning ? "جارٍ التشغيل…" : "تشغيل"}
            </Button>

            {state?.error && (
              <p className="admin-notice admin-notice--danger font-bold" role="alert">
                <CircleAlert size={17} aria-hidden />
                {state.error}
              </p>
            )}

            {state?.result && (
              <div className="flex flex-col gap-3 border-t border-[var(--line-soft)] pt-4 text-sm leading-7 text-[var(--ink-soft)]">
                <p className="flex items-center gap-2 font-bold text-[var(--brand)]">
                  <CircleCheck size={17} aria-hidden />
                  اكتمل خلال {(state.result.durationMs / 1000).toFixed(1)} ث
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <div className="admin-mini-stat">
                    <b>{state.result.videosDiscovered}</b>
                    <span>فيديوهات مكتشفة</span>
                  </div>
                  <div className="admin-mini-stat">
                    <b>{state.result.videosCreated}</b>
                    <span>حلقات جديدة</span>
                  </div>
                  <div className="admin-mini-stat">
                    <b>{state.result.videosUpdated}</b>
                    <span>حلقات محدَّثة</span>
                  </div>
                  <div className="admin-mini-stat">
                    <b>{state.result.videosSkipped}</b>
                    <span>تم تجاوزها</span>
                  </div>
                </div>

                {(state.result.shortsCreated > 0 || state.result.shortsUpdated > 0) && (
                  <p>
                    Shorts: {state.result.shortsCreated} جديد، {state.result.shortsUpdated} محدَّث (منفصلة تمامًا عن
                    الحلقات)
                  </p>
                )}
                {state.result.playlistsDiscovered > 0 && <p>قوائم تشغيل مكتشفة: {state.result.playlistsDiscovered}</p>}
                {state.result.seriesCreated > 0 && (
                  <p>سلاسل جديدة (مسودة، بانتظار المراجعة): {state.result.seriesCreated}</p>
                )}
                {state.result.videosUnknown > 0 && (
                  <details className="admin-notice admin-notice--warning block">
                    <summary className="cursor-pointer font-bold text-[var(--accent-strong)]">
                      {state.result.videosUnknown} فيديو يحتاج مراجعة يدوية (تعذّر تصنيفه كحلقة أو Short)
                    </summary>
                    <ul className="mt-2 space-y-1">
                      {state.result.unknownVideoIds.map((videoId) => (
                        <li key={videoId} className="text-xs" dir="ltr">
                          {videoId}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
                {state.result.errors.length > 0 && (
                  <details className="admin-notice admin-notice--warning block">
                    <summary className="cursor-pointer font-bold text-[var(--accent-strong)]">
                      {state.result.errors.length} خطأ أثناء التشغيل
                    </summary>
                    <ul className="mt-2 space-y-1">
                      {state.result.errors.slice(0, 20).map((error, index) => (
                        <li key={index} className="text-xs">
                          {error.videoId ? `[${error.videoId}] ` : error.playlistId ? `[${error.playlistId}] ` : ""}
                          {error.message}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
