import type { ReactNode } from "react";
import { Wrench } from "lucide-react";

/**
 * Honest placeholder for the admin sections that don't have a real editor
 * yet (recommendations/transcript/mind map, and anything needing a real
 * database). Says so plainly instead of shipping a form that does nothing.
 */
export function ComingNextPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-4 border border-dashed border-[var(--line)] bg-[var(--paper)] p-6">
      <Wrench className="mt-1 shrink-0 text-[var(--muted)]" size={20} aria-hidden="true" />
      <div>
        <h2 className="text-lg font-black">{title}</h2>
        <div className="mt-2 max-w-xl leading-7 text-[var(--ink-soft)]">{children}</div>
      </div>
    </div>
  );
}
