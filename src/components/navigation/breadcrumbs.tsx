import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type Crumb = { label: string; href?: string };

/** Accessible breadcrumb trail. The last crumb is the current page and is not a link. */
export function Breadcrumbs({ items, onDark = false }: { items: Crumb[]; onDark?: boolean }) {
  return (
    <nav
      aria-label="مسار التصفح"
      className={cn("meta", onDark && "!text-[var(--on-brand-soft)]")}
    >
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className={cn("transition-colors", onDark ? "hover:text-white" : "hover:text-black")}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn("font-bold", isLast && (onDark ? "text-white" : "text-[var(--ink)]"))}
                >
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronLeft size={13} aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
