import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("chip", className)}>{children}</span>;
}
