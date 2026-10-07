import Image from "next/image";
import Link from "next/link";
import { Globe, LogOut, ShieldCheck } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-confirm";
import { IconButton } from "@/components/ui/icon-button";
import { ACCOUNT_HREF } from "@/components/admin/admin-nav";

/** Below `lg` the sidebar is gone: this is the landing header's floating bar, with the way back to the site. */
export function AdminTopbar() {
  return (
    <header className="admin-topbar">
      <div className="site-header-bar mx-auto flex h-15 max-w-300 items-center justify-between gap-4 rounded-[22px] px-4 sm:px-6 bg-white/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            aria-label="وعي، لوحة الإدارة"
            className="shrink-0"
          >
            <Image
              src="/brand/logo-deep.png"
              alt="وعي"
              width={125}
              height={100}
              priority
              className="h-8 w-auto brightness-0 sm:h-9"
            />
          </Link>
          <span className="eyebrow-pill px-3 py-1.5 text-[.68rem]">
            الإدارة
          </span>
        </div>
        <div className="flex items-center gap-2">
          <IconButton href={ACCOUNT_HREF} aria-label="الحساب والأمان">
            <ShieldCheck size={18} />
          </IconButton>
          <IconButton href="/" aria-label="عرض الموقع">
            <Globe size={18} />
          </IconButton>
          <LogoutButton className="icon-btn" aria-label="تسجيل الخروج">
            <LogOut size={18} />
          </LogoutButton>
        </div>
      </div>
    </header>
  );
}
