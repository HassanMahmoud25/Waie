import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { PersonEditor } from "@/components/admin/person-editor";
import { getPersonForAdmin } from "@/lib/admin/content/people";
import { requireAdmin } from "@/lib/auth/server";

export const metadata: Metadata = { title: "تعديل شخص" };

export default async function EditPersonPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const person = await getPersonForAdmin(id);
  if (!person) notFound();

  return (
    <AdminShell title={person.name} description="تعديل بيانات الشخص." back={{ label: "الأشخاص", href: "/admin/people" }}>
      <PersonEditor person={person} />
    </AdminShell>
  );
}
