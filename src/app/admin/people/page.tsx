import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Pencil, User } from "lucide-react";
import { PERSON_FORMS, EPISODE_FORMS, formatArabicDate, formatCount } from "@/lib/utils/format";
import { AdminShell } from "@/components/admin/admin-shell";
import { CreatePersonForm } from "@/components/admin/create-person-form";
import { EmptyState } from "@/components/content/empty-state";
import { requireAdmin } from "@/lib/auth/server";
import { listPeopleForAdmin } from "@/lib/admin/content/people";

export const metadata: Metadata = { title: "الأشخاص" };

/**
 * The People CMS list -- canonical Person records that episodes pick
 * participants from (see EpisodeParticipant in prisma/schema.prisma).
 * Mirrors app/admin/topics/page.tsx's shape exactly. Deliberately unrelated
 * to the static Hosts page (app/(site)/hosts) -- this manages a different,
 * database-backed concept.
 */
export default async function AdminPeoplePage() {
  await requireAdmin();
  const people = await listPeopleForAdmin();

  return (
    <AdminShell
      title="الأشخاص"
      description={`${formatCount(people.length, PERSON_FORMS)} — أنشئ سجلًا جديدًا لشخص يمكن ربطه بأي حلقة كمشارك فيها.`}
      back={{ label: "لوحة الإدارة", href: "/admin" }}
    >
      <CreatePersonForm />

      <div className="mt-6">
        {people.length > 0 ? (
          <div className="admin-panel">
            {people.map((person) => (
              <div key={person.id} className="admin-row">
                <span className="admin-tile overflow-hidden">
                  {person.imageUrl ? (
                    <Image src={person.imageUrl} alt="" width={44} height={44} unoptimized className="h-full w-full object-cover" />
                  ) : (
                    <User size={19} aria-hidden="true" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="admin-row__title">{person.name}</p>
                  <p className="meta mt-1">
                    <span>{formatCount(person._count.episodeParticipants, EPISODE_FORMS)}</span>
                    <span>حُدّث {formatArabicDate(person.updatedAt)}</span>
                  </p>
                </div>
                <Link
                  href={`/admin/people/${person.id}`}
                  className="btn btn-secondary shrink-0 max-sm:size-11 max-sm:min-h-0 max-sm:rounded-full max-sm:p-0"
                  aria-label={`تعديل: ${person.name}`}
                >
                  <Pencil size={15} aria-hidden="true" />
                  <span className="max-sm:hidden">تعديل</span>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={User} title="لا يوجد أشخاص بعد." description="أضف شخصًا جديدًا من الحقل أعلاه لتتمكن من إضافته كمشارك في الحلقات." />
        )}
      </div>
    </AdminShell>
  );
}
