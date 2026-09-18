import type { Metadata } from "next";
import { contentRepository } from "@/lib/repositories";
import { AdminShell } from "@/components/admin/admin-shell";
import { ComingNextPanel } from "@/components/admin/coming-next-panel";

export const metadata: Metadata = { title: "المختارات" };

export default async function AdminCollectionsPage() {
  const collections = await contentRepository.listCollections();

  return (
    <AdminShell
      title="المختارات"
      description={`${collections.length} مختارات تحريرية.`}
      back={{ label: "لوحة الإدارة", href: "/admin" }}
    >
      <div className="border-t border-[var(--line)]">
        {collections.map((collection) => (
          <div key={collection.id} className="border-b border-[var(--line)] py-4">
            <b className="block text-lg">{collection.title}</b>
            <p className="mt-1 max-w-xl text-sm leading-6 text-[var(--ink-soft)]">{collection.description}</p>
            <p className="mt-2 text-xs font-bold text-[var(--muted)]">{collection.episodeIds.length} حلقة</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <ComingNextPanel title="إنشاء وتعديل المختارات">
          يحتاج هذا القسم إلى قاعدة بيانات موصولة (Prisma) ليصبح قابلًا للتعديل من هنا. حاليًا يمكن تعديل بيانات
          المختارات مباشرة في <code className="rounded bg-[var(--surface)] px-1.5 py-0.5 text-sm">src/data/collections.ts</code>.
        </ComingNextPanel>
      </div>
    </AdminShell>
  );
}
