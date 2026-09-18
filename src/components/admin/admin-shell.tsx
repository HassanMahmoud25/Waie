import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type AdminShellProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Set when this page is nested under /admin, e.g. { label: "الحلقات", href: "/admin/episodes" }. */
  back?: { label: string; href: string };
  action?: ReactNode;
  children: ReactNode;
};

/**
 * Consistent chrome for every /admin page: eyebrow + title + optional back
 * link, a "عرض الموقع" escape hatch, and an optional page-level action slot.
 * Keeps every admin screen on the same design tokens as the public site —
 * no separate admin theme.
 */
export function AdminShell({ eyebrow = "إدارة المحتوى", title, description, back, action, children }: AdminShellProps) {
  return (
    <main className="min-h-screen bg-[var(--canvas)]">
      <div className="container py-10 md:py-14">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            {back && (
              <Link
                href={back.href}
                className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-[var(--brand)]"
              >
                <ChevronRight size={15} aria-hidden="true" />
                {back.label}
              </Link>
            )}
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="mt-2 text-3xl font-black tracking-[-.03em] md:text-4xl">{title}</h1>
            {description && <p className="mt-3 max-w-xl leading-7 text-[var(--ink-soft)]">{description}</p>}
          </div>
          <div className="flex items-center gap-3">
            {action}
            <Button href="/" variant="secondary">
              عرض الموقع
            </Button>
          </div>
        </div>

        <div className="mt-10">{children}</div>
      </div>
    </main>
  );
}
