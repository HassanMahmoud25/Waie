import type { ContentStatus } from "@/types/content-status";
import { cn } from "@/lib/utils/cn";

const statusLabel: Record<ContentStatus, string> = {
  PUBLISHED: "منشور",
  DRAFT: "مسودة",
  ARCHIVED: "مؤرشف",
};

const statusClass: Record<ContentStatus, string> = {
  PUBLISHED: "admin-status--published",
  DRAFT: "admin-status--draft",
  ARCHIVED: "",
};

export function StatusBadge({ status }: { status: ContentStatus }) {
  return <span className={cn("admin-status", statusClass[status])}>{statusLabel[status]}</span>;
}
