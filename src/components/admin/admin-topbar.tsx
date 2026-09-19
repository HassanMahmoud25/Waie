import Image from "next/image";
import Link from "next/link";
import { Globe } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";

/** Below `lg` the sidebar is gone: this is the landing header's floating bar, with the way back to the site. */
export function AdminTopbar() {
  return (
    <header className="admin-topbar">
      <div className="site-header-bar mx-auto flex h-[60px] max-w-[1200px] items-center justify-between gap-4 rounded-[22px] px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/admin" aria-label="وعي، لوحة الإدارة" className="shrink-0">
            <Image
              src="/brand/logo-deep.png"
              alt="وعي"
              width={125}
              height={100}
              priority
              className="h-8 w-auto brightness-0 sm:h-9"
            />
          </Link>
          <span className="eyebrow-pill px-3 py-1.5 text-[.68rem]">الإدارة</span>
        </div>
        <IconButton href="/" aria-label="عرض الموقع">
          <Globe size={18} />
        </IconButton>
      </div>
    </header>
  );
}
