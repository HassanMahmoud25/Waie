import type { Metadata } from "next";
import Link from "next/link";
import { contentRepository } from "@/lib/repositories";
import { getSessionUser } from "@/lib/auth/server";
import { getContinueWatching } from "@/lib/library/continue-watching";
import { LibraryContent } from "@/components/library/library-content";

export const metadata: Metadata = { title: "مكتبتي" };

export default async function LibraryPage() {
  // Real, server-verified session -- used here only to know who's actually
  // signed in (and, below, to fetch the account's own Continue Watching rows).
  // Series stays a full fetch (a handful of rows, not episode-catalog-scale);
  // the actual episode data for saved/completed/continue-watching sections is
  // resolved client-side by id, once LibraryContent knows which ids it needs
  // -- see getEpisodesByIdsAction, never the whole episode table here.
  const [series, sessionUser, continueWatching] = await Promise.all([
    contentRepository.listSeries(),
    getSessionUser(),
    getContinueWatching(),
  ]);

  return (
    <main className="container py-12 md:py-16">
      <p className="eyebrow-pill w-fit">مساحتك الخاصة</p>
      <h1 className="mt-4 text-2xl font-black leading-[1.8] tracking-[-.03em] md:text-3xl">
        مكتبتي
      </h1>
      {sessionUser ? (
        <p className="mt-4 max-w-xl text-lg leading-8 text-[var(--ink-soft)]">
          سجّلت الدخول باسم <b className="text-[var(--ink)]">{sessionUser.email}</b>. حلقاتك المحفوظة وتقدّمك في
          المشاهدة محفوظة على حسابك وتصلك أينما سجّلت الدخول.
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

      <LibraryContent series={series} continueWatching={continueWatching} />
    </main>
  );
}
