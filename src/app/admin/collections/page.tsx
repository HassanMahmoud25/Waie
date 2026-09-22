import type { Metadata } from "next";
import Link from "next/link";
import { FolderOpen, Pencil } from "lucide-react";
import { EPISODE_FORMS, formatArabicDate, formatCount } from "@/lib/utils/format";
import { AdminShell } from "@/components/admin/admin-shell";
import { StatusBadge } from "@/components/admin/status-badge";
import { CreateCollectionForm } from "@/components/admin/create-collection-form";
import { EmptyState } from "@/components/content/empty-state";
import { requireAdmin } from "@/lib/auth/server";
import { listCollectionsForAdmin } from "@/lib/admin/content/collections";
import type { ContentStatus } from "@/types/content-status";

export const metadata: Metadata = { title: "المختارات" };

const statusTabs: { key: string; label: string; status: ContentStatus | null }[] = [
  { key: "all", label: "الكل", status: null },
  { key: "published", label: "منشورة", status: "PUBLISHED" },
  { key: "draft", label: "مسودات", status: "DRAFT" },
  { key: "archived", label: "مؤرشفة", status: "ARCHIVED" },
];

export default async function AdminCollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status: statusParam } = await searchParams;
  const activeTab = statusTabs.find((tab) => tab.key === statusParam) ?? statusTabs[0];

  // Admin-only, unfiltered data path: listCollectionsForAdmin() returns every
  // status, unlike contentRepository.listCollections() (PUBLISHED-only).
  const allCollections = await listCollectionsForAdmin();
  const collections = activeTab.status ? allCollections.filter((c) => c.status === activeTab.status) : allCollections;

  return (
    <AdminShell
      title="المختارات"
      description={`${allCollections.length} مختارات تحريرية — أنشئ مجموعة جديدة أو عدّل بياناتها وحلقاتها وحالة نشرها.`}
      back={{ label: "لوحة الإدارة", href: "/admin" }}
    >
      <CreateCollectionForm />

      <nav className="admin-tabs mt-6" aria-label="تصفية حسب الحالة">
        {statusTabs.map((tab) => {
          const count = tab.status
            ? allCollections.filter((c) => c.status === tab.status).length
            : allCollections.length;
          return (
            <Link
              key={tab.key}
              href={tab.key === "all" ? "/admin/collections" : `/admin/collections?status=${tab.key}`}
              aria-current={tab.key === activeTab.key ? "page" : undefined}
              className="admin-tab"
            >
              {tab.label}
              <span className="opacity-70">{count}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4">
        {collections.length > 0 ? (
          <div className="admin-panel">
            {collections.map((collection) => (
              <div key={collection.id} className="admin-row">
                <span className="admin-tile">
                  <FolderOpen size={20} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <StatusBadge status={collection.status} />
                  </div>
                  <p className="admin-row__title">{collection.title}</p>
                  <p className="meta mt-1">
                    <span dir="ltr">/{collection.slug}</span>
                    <span>{formatCount(collection._count.items, EPISODE_FORMS)}</span>
                    <span>حُدّثت {formatArabicDate(collection.updatedAt)}</span>
                  </p>
                </div>
                <Link
                  href={`/admin/collections/${collection.id}`}
                  className="btn btn-secondary shrink-0 max-sm:size-11 max-sm:min-h-0 max-sm:rounded-full max-sm:p-0"
                  aria-label={`تعديل: ${collection.title}`}
                >
                  <Pencil size={15} aria-hidden="true" />
                  <span className="max-sm:hidden">تعديل</span>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FolderOpen}
            title="لا توجد مختارات هنا."
            description={
              activeTab.status ? "لا توجد مختارات بهذه الحالة حاليًا." : "أضف مجموعة جديدة من الحقل أعلاه."
            }
          />
        )}
      </div>
    </AdminShell>
  );
}
