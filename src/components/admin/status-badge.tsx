import type { ContentStatus } from "@/types/content-status";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/utils/cn";

const statusLabel: Record<ContentStatus, string> = {
  PUBLISHED: "منشور",
  DRAFT: "مسودة",
  ARCHIVED: "مؤرشف",
};

const statusClass: Record<ContentStatus, string> = {
  PUBLISHED: "border-[var(--brand)] text-[var(--brand)]",
  DRAFT: "border-[var(--accent-strong)] text-[var(--accent-strong)]",
  ARCHIVED: "border-[var(--muted)] text-[var(--muted)]",
};

export function StatusBadge({ status }: { status: ContentStatus }) {
  return <Tag className={cn("py-1 text-xs", statusClass[status])}>{statusLabel[status]}</Tag>;
}
