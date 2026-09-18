import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Consistent empty state for every async/optional section: recommendations,
 * transcript, mind map, search results, saved library, etc.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      {Icon && <Icon className="mx-auto mb-3 text-[var(--muted)]" size={28} aria-hidden="true" />}
      <p className="font-bold text-[var(--ink)]">{title}</p>
      {description && <p className="mt-1 text-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
