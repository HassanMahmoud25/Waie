import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

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
 * The page header every /admin screen shares: optional back chip, eyebrow pill,
 * title, description and an optional action slot. The surrounding frame
 * (sidebar / tab bar) lives in app/admin/layout.tsx; this is just the page's
 * own heading, laid out like the library and series pages on the public site.
 */
export function AdminShell({ eyebrow = "إدارة المحتوى", title, description, back, action, children }: AdminShellProps) {
  return (
    <>
      <header>
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {back && (
                <Link href={back.href} className="admin-back">
                  <ChevronRight size={16} aria-hidden="true" />
                  {back.label}
                </Link>
              )}
              <p className="eyebrow-pill w-fit">{eyebrow}</p>
            </div>
            {/* Section names get the site's page-title size; a long episode title as the heading gets a step down. */}
            <h1
              className={cn(
                "mt-4 max-w-3xl text-balance font-black leading-[1.6] tracking-[-.03em]",
                title.length > 36 ? "text-xl md:text-2xl" : "text-2xl md:text-3xl",
              )}
            >
              {title}
            </h1>
            {description && (
              <p className="mt-3 max-w-xl leading-8 text-[var(--ink-soft)]">{description}</p>
            )}
          </div>
          {action}
        </div>
      </header>

      <div className="mt-8 md:mt-10">{children}</div>
    </>
  );
}
