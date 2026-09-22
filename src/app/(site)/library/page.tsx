import type { Metadata } from "next";
import Link from "next/link";
import { contentRepository } from "@/lib/repositories";
import { getSessionUser } from "@/lib/auth/server";
import { LibraryContent } from "@/components/library/library-content";

export const metadata: Metadata = { title: "مكتبتي" };

export default async function LibraryPage() {
  // Real, server-verified session -- used here only to know who's actually
  // signed in. The saved-episodes/progress data below is still read from
  // localStorage via LibraryContent/useLibrary (unchanged; that migration is
  // a separate, later phase), so the copy below is intentionally honest about
  // that rather than implying sync already works.
  const [episodes, series, sessionUser] = await Promise.all([
    contentRepository.listEpisodes(),
    contentRepository.listSeries(),
    getSessionUser(),
  ]);

  return (
    <main className="container py-14">
      <p className="eyebrow-pill w-fit">مساحتك الخاصة</p>
      <h1 className="mt-4 text-2xl font-black leading-[1.8] tracking-[-.03em] md:text-3xl">
        مكتبتي
      </h1>
      {sessionUser ? (
        <p className="mt-4 max-w-xl text-lg leading-8 text-[var(--ink-soft)]">
          سجّلت الدخول باسم <b className="text-[var(--ink)]">{sessionUser.email}</b>. تُحفظ حلقاتك وتقدّمك فيها
          حاليًا على هذا الجهاز؛ مزامنتها عبر أجهزتك ستتوفر قريبًا.
        </p>
      ) : (
        <p className="mt-4 max-w-xl text-lg leading-8 text-[var(--ink-soft)]">
          تُحفظ حلقاتك وتقدّمك فيها هنا على هذا الجهاز.{" "}
          <Link href="/login" className="font-bold text-[var(--ink)] hover:underline">
            سجّل الدخول
          </Link>{" "}
          لمزامنتها عبر أجهزتك.
        </p>
      )}

      <LibraryContent episodes={episodes} series={series} />
    </main>
  );
}
