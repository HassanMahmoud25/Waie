import type { Metadata } from "next";
import { FolderOpen } from "lucide-react";
import { contentRepository } from "@/lib/repositories";
import { EPISODE_FORMS, formatCount } from "@/lib/utils/format";
import { AdminShell } from "@/components/admin/admin-shell";
import { ComingNextPanel } from "@/components/admin/coming-next-panel";
import { EmptyState } from "@/components/content/empty-state";
import { requireAdmin } from "@/lib/auth/server";

export const metadata: Metadata = { title: "المختارات" };

export default async function AdminCollectionsPage() {
  await requireAdmin();
  const collections = await contentRepository.listAllCollections();

  return (
    <AdminShell
      title="المختارات"
      description={`${collections.length} مختارات تحريرية.`}
      back={{ label: "لوحة الإدارة", href: "/admin" }}
    >
      {collections.length > 0 ? (
        <div className="admin-panel">
          {collections.map((collection) => (
            <div key={collection.id} className="admin-row items-start">
              <span className="admin-tile">
                <FolderOpen size={20} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-base font-extrabold leading-[1.8]">{collection.title}</p>
                <p className="max-w-xl text-sm leading-7 text-[var(--ink-soft)]">{collection.description}</p>
                <p className="meta mt-1.5">
                  <span>{formatCount(collection.episodeIds.length, EPISODE_FORMS)}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderOpen}
          title="لا توجد مختارات بعد."
          description="المختارات قوائم تحريرية تجمع حلقات حول فكرة واحدة، وستظهر هنا عند إضافتها."
        />
      )}

      <div className="mt-6 sm:mt-8">
        <ComingNextPanel title="إنشاء وتعديل المختارات">
          يحتاج هذا القسم إلى قاعدة بيانات موصولة (Prisma) ليصبح قابلًا للتعديل من هنا. حاليًا يمكن تعديل بيانات
          المختارات مباشرة في{" "}
          <code dir="ltr" className="rounded-md bg-white/70 px-1.5 py-0.5 text-[.8rem]">
            src/data/collections.ts
          </code>
          .
        </ComingNextPanel>
      </div>
    </AdminShell>
  );
}
