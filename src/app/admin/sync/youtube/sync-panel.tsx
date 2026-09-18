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
          <div key={operation.key} className="flex flex-col gap-4 bg-[var(--surface)] p-6">
            <div className="flex items-start gap-3">
              <Icon className="mt-0.5 shrink-0 text-[var(--brand)]" size={20} aria-hidden />
              <div>
                <h3 className="font-black">{operation.title}</h3>
                <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">{operation.description}</p>
              </div>
            </div>

            <Button
              variant="secondary"
              onClick={() => run(operation)}
              disabled={isPending}
              icon={isRunning ? <Loader2 className="animate-spin" size={16} aria-hidden /> : undefined}
              iconPosition="start"
              aria-busy={isRunning}
            >
              {isRunning ? "جارٍ التشغيل…" : "تشغيل"}
            </Button>

            {state?.error && (
              <p className="flex items-start gap-2 text-sm font-bold text-red-600" role="alert">
                <CircleAlert className="mt-0.5 shrink-0" size={16} aria-hidden />
                {state.error}
              </p>
            )}

            {state?.result && (
              <div className="border-t border-[var(--line)] pt-3 text-sm leading-7 text-[var(--ink-soft)]">
                <p className="mb-1 flex items-center gap-2 font-bold text-[var(--brand)]">
                  <CircleCheck size={16} aria-hidden />
                  اكتمل خلال {(state.result.durationMs / 1000).toFixed(1)} ث
                </p>
                <p>فيديوهات مكتشفة: {state.result.videosDiscovered}</p>
                <p>حلقات جديدة: {state.result.videosCreated}</p>
                <p>حلقات محدَّثة: {state.result.videosUpdated}</p>
                <p>تم تجاوزها: {state.result.videosSkipped}</p>
                {state.result.playlistsDiscovered > 0 && <p>قوائم تشغيل مكتشفة: {state.result.playlistsDiscovered}</p>}
                {state.result.seriesCreated > 0 && <p>سلاسل جديدة: {state.result.seriesCreated}</p>}
                {state.result.errors.length > 0 && (
                  <details className="mt-2">
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
