import type { ReactNode } from "react";
import { Wrench } from "lucide-react";

/**
 * Honest placeholder for the admin sections that don't have a real editor
 * yet (recommendations/transcript/mind map, and anything needing a real
 * database). Says so plainly instead of shipping a form that does nothing.
 */
export function ComingNextPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="admin-panel admin-panel--dashed flex items-start gap-4 p-5 sm:p-6">
      <span className="admin-tile admin-tile--gold">
        <Wrench size={19} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h2 className="text-base font-black leading-[1.9]">{title}</h2>
        <div className="mt-1 max-w-xl text-sm leading-7 text-[var(--ink-soft)]">{children}</div>
      </div>
    </div>
  );
}
