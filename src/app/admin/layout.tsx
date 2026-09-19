import type { ReactNode } from "react";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { PageTransition } from "@/components/shared/page-transition";

/**
 * One persistent frame for every /admin route: the sidebar (desktop) or top bar
 * + tab bar (tablet/mobile) stays mounted while only the page content
 * cross-fades, exactly like the public site's header does.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AdminTopbar />
      <div className="admin-frame">
        <AdminSidebar />
        <main className="admin-main">
          <div className="admin-content">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
      <AdminMobileNav />
    </>
  );
}
