import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProgressBar } from "@/components/shared/progress-bar";
import { EPISODE_FORMS, formatCount } from "@/lib/utils/format";
import type { CompletenessField } from "@/lib/admin/content/statistics";

/**
 * One row per audited field: a present/total fraction, a bar, and -- only
 * when something is actually missing -- a plain link back to the published
 * episodes list. Deliberately not a new filtered view: the admin episodes
 * list has no "missing X" filter today, and building one just for this
 * summary would be the "complicated filtering system" the spec asks to
 * avoid. Landing on the existing "published" tab is enough to act on.
 */
export function ContentCompleteness({ fields }: { fields: CompletenessField[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {fields.map((field) => {
        const missing = field.total - field.present;
        const percent = field.total > 0 ? (field.present / field.total) * 100 : 100;
        return (
          <div className="admin-panel p-4" key={field.key}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-bold">{field.label}</span>
              <span className="text-sm font-black tabular-nums">
                {field.present} / {field.total}
              </span>
            </div>
            <ProgressBar percent={percent} className="mt-3 h-1.5 w-full max-w-none" />
            {missing > 0 && (
              <Link href="/admin/episodes?status=published" className="section-link mt-3 inline-flex text-xs">
                {formatCount(missing, EPISODE_FORMS)} تفتقد {field.label}
                <ArrowLeft size={12} aria-hidden="true" />
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
