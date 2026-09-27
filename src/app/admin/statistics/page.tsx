import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileEdit,
  Headphones,
  Layers,
  ListChecks,
  Percent,
  UserPlus,
  Users,
  UsersRound,
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { StatBarList } from "@/components/admin/stat-bar-list";
import { MiniChart } from "@/components/admin/mini-chart";
import { ContentCompleteness } from "@/components/admin/content-completeness";
import { EmptyState } from "@/components/content/empty-state";
import { requireAdmin } from "@/lib/auth/server";
import {
  EPISODE_FORMS,
  PERSON_FORMS,
  formatApproxHours,
  formatArabicMonth,
  formatCount,
  formatDuration,
  formatShortDayMonth,
} from "@/lib/utils/format";
import {
  getContentCompleteness,
  getContentOverview,
  getEpisodeDurationStats,
  getEpisodesBySeries,
  getParticipantStatistics,
  getPublishingActivity,
} from "@/lib/admin/content/statistics";
import {
  REGISTRATION_RANGES,
  buildRegistrationSeries,
  countNewUsers,
  getTopCompletedEpisodes,
  getTopSavedEpisodes,
  getUserActivitySummary,
  getUserRegistrationDates,
  resolveRegistrationWindow,
  type RegistrationRange,
} from "@/lib/admin/users/statistics";

export const metadata: Metadata = { title: "الإحصائيات" };

/**
 * Each statistic is its own independent query settled separately here, so
 * one failing query -- a bad connection mid-request, a slow aggregate timing
 * out -- shows an inline notice on just that section instead of taking down
 * the whole page via app/admin/error.tsx.
 */
async function settle<T>(promise: Promise<T>): Promise<{ ok: true; value: T } | { ok: false }> {
  try {
    return { ok: true, value: await promise };
  } catch {
    return { ok: false };
  }
}

function SectionError() {
  return <p className="admin-notice admin-notice--danger">تعذّر تحميل هذه الإحصائية. حاول تحديث الصفحة.</p>;
}

function parseRange(value: string | undefined): RegistrationRange {
  return REGISTRATION_RANGES.find((entry) => entry.key === value)?.key ?? "30d";
}

export default async function AdminStatisticsPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  await requireAdmin();
  const { range: rangeParam } = await searchParams;
  const range = parseRange(rangeParam);

  const [registrationDates, userActivity, topSaved, topCompleted, overview, duration, seriesDistribution, publishing, participants, completeness] =
    await Promise.all([
      settle(getUserRegistrationDates()),
      settle(getUserActivitySummary()),
      settle(getTopSavedEpisodes()),
      settle(getTopCompletedEpisodes()),
      settle(getContentOverview()),
      settle(getEpisodeDurationStats()),
      settle(getEpisodesBySeries()),
      settle(getPublishingActivity()),
      settle(getParticipantStatistics()),
      settle(getContentCompleteness()),
    ]);

  const now = new Date();
  const newUserCounts = registrationDates.ok ? countNewUsers(registrationDates.value, now) : null;
  const totalUsers = registrationDates.ok ? registrationDates.value.length : null;
  const earliestRegistration =
    registrationDates.ok && registrationDates.value.length > 0
      ? new Date(Math.min(...registrationDates.value.map((date) => date.getTime())))
      : null;
  const window = registrationDates.ok ? resolveRegistrationWindow(range, earliestRegistration, now) : null;
  const registrationSeries =
    registrationDates.ok && window ? buildRegistrationSeries(registrationDates.value, window.granularity, window.start, window.end) : [];
  const labelFor = (date: Date) => (window?.granularity === "month" ? formatArabicMonth(date) : formatShortDayMonth(date));

  const userKpis =
    newUserCounts && userActivity.ok
      ? [
          { label: "إجمالي المستخدمين", value: totalUsers ?? 0, icon: UsersRound },
          { label: "جدد آخر 30 يومًا", value: newUserCounts.last30Days, icon: UserPlus },
          { label: "جدد آخر 7 أيام", value: newUserCounts.last7Days, icon: UserPlus },
          { label: "لديهم نشاط في التطبيق", value: userActivity.value.usersWithAnyActivity, icon: Activity },
          { label: "إكمالات الحلقات", value: userActivity.value.completedProgressRecords, icon: ListChecks },
          {
            label: "متوسط نسبة الإكمال",
            value: userActivity.value.averageCompletionPercent !== null ? `${userActivity.value.averageCompletionPercent.toFixed(0)}%` : "—",
            icon: Percent,
          },
        ]
      : [];

  const contentKpis = overview.ok
    ? [
        { label: "إجمالي الحلقات", value: overview.value.totalEpisodes, icon: Headphones },
        { label: "منشورة", value: overview.value.publishedEpisodes, icon: CheckCircle2 },
        { label: "مسودات", value: overview.value.draftEpisodes, icon: FileEdit },
        { label: "السلاسل", value: overview.value.totalSeries, icon: Layers },
        { label: "الأشخاص", value: overview.value.totalPeople, icon: Users },
        { label: "إجمالي المدة", value: formatApproxHours(overview.value.totalDurationSeconds), icon: Clock3 },
      ]
    : [];

  return (
    <AdminShell
      title="الإحصائيات"
      description="لقطة سريعة لحالة المحتوى في وعي والأشخاص الذين يستخدمونه — من واقع قاعدة البيانات نفسها، بلا أي تتبّع لسلوك الزوار."
      back={{ label: "لوحة الإدارة", href: "/admin" }}
    >
      {/* ===================================================================
          Users -- the visually prominent section (soft tinted panel, see
          .admin-users-section), placed first per this being the current
          priority. Every number here comes from the real User table and its
          content relations; there is no sign-in tracking, email-verification
          field, or OAuth provider in this app's schema, so none of those are
          shown here (see the implementation report).
          =================================================================== */}
      <section className="admin-users-section">
        <h2 className="admin-section-heading">
          <span className="admin-section-heading__icon">
            <UsersRound size={18} aria-hidden="true" />
          </span>
          المستخدمون
        </h2>

        {userKpis.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
            {userKpis.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div className="admin-panel admin-stat" key={kpi.label}>
                  <span className="admin-tile">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="admin-stat__value">{kpi.value}</span>
                    <span className="mt-1.5 block text-sm font-bold text-[var(--ink-soft)]">{kpi.label}</span>
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <SectionError />
        )}

        {/* New users breakdown across the fixed calendar windows the brief asked for */}
        <div className="admin-panel mt-6">
          <div className="admin-panel__head">
            <h3 className="admin-panel__title">مستخدمون جدد</h3>
          </div>
          <div className="p-4 sm:p-5">
            {newUserCounts ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                <div className="admin-mini-stat">
                  <b>{newUserCounts.today}</b>
                  <span>اليوم</span>
                </div>
                <div className="admin-mini-stat">
                  <b>{newUserCounts.last7Days}</b>
                  <span>آخر 7 أيام</span>
                </div>
                <div className="admin-mini-stat">
                  <b>{newUserCounts.last30Days}</b>
                  <span>آخر 30 يومًا</span>
                </div>
                <div className="admin-mini-stat">
                  <b>{newUserCounts.thisMonth}</b>
                  <span>هذا الشهر</span>
                </div>
                <div className="admin-mini-stat">
                  <b>{newUserCounts.thisYear}</b>
                  <span>هذا العام</span>
                </div>
              </div>
            ) : (
              <SectionError />
            )}
          </div>
        </div>

        {/* Growth (cumulative) + registration activity (per period), sharing one period filter */}
        <div className="admin-panel mt-6">
          <div className="admin-panel__head flex-wrap gap-y-3">
            <h3 className="admin-panel__title">النمو والتسجيل</h3>
            <nav className="admin-tabs" aria-label="الفترة الزمنية">
              {REGISTRATION_RANGES.map((entry) => (
                <Link
                  key={entry.key}
                  href={`/admin/statistics?range=${entry.key}`}
                  aria-current={entry.key === range ? "page" : undefined}
                  className="admin-tab"
                >
                  {entry.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="grid gap-6 p-4 sm:p-5 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-bold text-[var(--ink-soft)]">نمو المستخدمين (الإجمالي التراكمي)</p>
              {registrationDates.ok ? (
                <MiniChart
                  variant="line"
                  points={registrationSeries.map((bucket) => ({ key: bucket.key, label: labelFor(bucket.date), value: bucket.totalUsers }))}
                />
              ) : (
                <SectionError />
              )}
            </div>
            <div>
              <p className="mb-3 text-sm font-bold text-[var(--ink-soft)]">
                تسجيلات جديدة حسب {window?.granularity === "month" ? "الشهر" : "اليوم"}
              </p>
              {registrationDates.ok ? (
                <MiniChart
                  variant="bar"
                  points={registrationSeries.map((bucket) => ({ key: bucket.key, label: labelFor(bucket.date), value: bucket.newUsers }))}
                />
              ) : (
                <SectionError />
              )}
            </div>
          </div>
        </div>

        {/* Product usage: library/progress facts, then non-exclusive activity segments */}
        <div className="admin-panel mt-6">
          <div className="admin-panel__head">
            <h3 className="admin-panel__title">النشاط داخل التطبيق</h3>
          </div>
          <div className="grid gap-6 p-4 sm:p-5 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-bold text-[var(--ink-soft)]">المكتبة والتقدّم</p>
              {userActivity.ok ? (
                <div className="grid grid-cols-2 gap-2">
                  <div className="admin-mini-stat">
                    <b>{userActivity.value.usersWithSaves}</b>
                    <span>مستخدمون لديهم محفوظات</span>
                  </div>
                  <div className="admin-mini-stat">
                    <b>{userActivity.value.totalSaves}</b>
                    <span>إجمالي الحلقات المحفوظة</span>
                  </div>
                  <div className="admin-mini-stat">
                    <b>{userActivity.value.averageSavesPerUser.toFixed(2)}</b>
                    <span>متوسط المحفوظات لكل مستخدم</span>
                  </div>
                  <div className="admin-mini-stat">
                    <b>{userActivity.value.usersWithProgress}</b>
                    <span>مستخدمون لديهم تقدّم استماع</span>
                  </div>
                  <div className="admin-mini-stat">
                    <b>{userActivity.value.distinctEpisodesWithProgress}</b>
                    <span>حلقات لها تقدّم مسجّل</span>
                  </div>
                  {userActivity.value.averageCompletionPercent !== null && (
                    <div className="admin-mini-stat">
                      <b>{userActivity.value.averageCompletionPercent.toFixed(1)}%</b>
                      <span className="block">متوسط نسبة الإكمال</span>
                      <span className="mt-1 block text-[0.68rem] opacity-80">
                        بناءً على {userActivity.value.episodesWithValidDurationSample} سجل تقدّم صالح
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <SectionError />
              )}
            </div>
            <div>
              <p className="mb-3 text-sm font-bold text-[var(--ink-soft)]">تصنيف المستخدمين حسب النشاط</p>
              {userActivity.ok ? (
                <>
                  <StatBarList
                    items={[
                      { key: "saves", label: "لديهم محتوى محفوظ", value: userActivity.value.usersWithSaves },
                      { key: "progress", label: "لديهم تقدّم استماع", value: userActivity.value.usersWithProgress },
                      { key: "completed", label: "أكملوا حلقة واحدة على الأقل", value: userActivity.value.usersWithCompletedContent },
                      { key: "notes", label: "كتبوا ملاحظات", value: userActivity.value.usersWithNotes },
                      { key: "follows", label: "يتابعون سلاسل", value: userActivity.value.usersWithFollows },
                      { key: "none", label: "بلا أي نشاط مسجّل", value: userActivity.value.usersWithNoActivity },
                    ]}
                  />
                  <p className="mt-3 text-xs text-[var(--muted)]">
                    فئات مستقلة وقد يقع المستخدم نفسه في أكثر من فئة — لا تُجمع لتساوي إجمالي المستخدمين.
                  </p>
                </>
              ) : (
                <SectionError />
              )}
            </div>
          </div>
        </div>

        {/* Episode-identified usage highlights -- never a user-identified ranking (see statistics.ts) */}
        <div className="admin-panel mt-6">
          <div className="admin-panel__head">
            <h3 className="admin-panel__title">استخدام المحتوى</h3>
          </div>
          <div className="grid gap-6 p-4 sm:p-5 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-bold text-[var(--ink-soft)]">الحلقات الأكثر حفظًا</p>
              {topSaved.ok ? (
                <StatBarList
                  items={topSaved.value.map((episode) => ({ key: episode.id, label: episode.title, value: episode.count }))}
                  emptyLabel="لا توجد حلقات محفوظة بعد."
                />
              ) : (
                <SectionError />
              )}
            </div>
            <div>
              <p className="mb-3 text-sm font-bold text-[var(--ink-soft)]">الحلقات الأكثر إكمالًا</p>
              {topCompleted.ok ? (
                <StatBarList
                  items={topCompleted.value.map((episode) => ({ key: episode.id, label: episode.title, value: episode.count }))}
                  emptyLabel="لا توجد حلقات مكتملة بعد."
                />
              ) : (
                <SectionError />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          Content -- the original CMS statistics, unchanged in substance.
          =================================================================== */}
      <div className="mt-8 sm:mt-10">
        <h2 className="admin-section-heading">
          <span className="admin-section-heading__icon">
            <BarChart3 size={18} aria-hidden="true" />
          </span>
          المحتوى
        </h2>

        {contentKpis.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
            {contentKpis.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div className="admin-panel admin-stat" key={kpi.label}>
                  <span className="admin-tile">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="admin-stat__value">{kpi.value}</span>
                    <span className="mt-1.5 block text-sm font-bold text-[var(--ink-soft)]">{kpi.label}</span>
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <SectionError />
        )}

        {/* Episode duration + distribution across series */}
        <section className="admin-panel mt-6 sm:mt-8" aria-labelledby="stats-content-title">
          <div className="admin-panel__head">
            <h3 id="stats-content-title" className="admin-panel__title">
              المدة والتوزيع على السلاسل
            </h3>
          </div>
          <div className="grid gap-6 p-4 sm:p-5 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-bold text-[var(--ink-soft)]">مدة الحلقات</p>
              {duration.ok ? (
                duration.value.episodesWithDuration > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="admin-mini-stat">
                      <b>{formatDuration(duration.value.totalSeconds)}</b>
                      <span>إجمالي مدة المحتوى</span>
                    </div>
                    <div className="admin-mini-stat">
                      <b>{formatDuration(duration.value.averageSeconds)}</b>
                      <span className="block">متوسط مدة الحلقة</span>
                      <span className="mt-1 block text-[0.68rem] opacity-80">
                        بناءً على {formatCount(duration.value.episodesWithDuration, EPISODE_FORMS)} تحتوي مدة صحيحة
                      </span>
                    </div>
                    {duration.value.shortest && (
                      <div className="admin-mini-stat">
                        <b>{formatDuration(duration.value.shortest.seconds)}</b>
                        <span className="block">أقصر حلقة</span>
                        <span className="mt-1 block truncate text-[0.68rem] opacity-80" title={duration.value.shortest.title}>
                          {duration.value.shortest.title}
                        </span>
                      </div>
                    )}
                    {duration.value.longest && (
                      <div className="admin-mini-stat">
                        <b>{formatDuration(duration.value.longest.seconds)}</b>
                        <span className="block">أطول حلقة</span>
                        <span className="mt-1 block truncate text-[0.68rem] opacity-80" title={duration.value.longest.title}>
                          {duration.value.longest.title}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <EmptyState icon={Clock3} title="لا تتوفر بيانات مدة صالحة بعد." />
                )
              ) : (
                <SectionError />
              )}
            </div>

            <div>
              <p className="mb-3 text-sm font-bold text-[var(--ink-soft)]">الحلقات حسب السلسلة</p>
              {seriesDistribution.ok ? (
                <StatBarList
                  items={seriesDistribution.value.map((row) => ({ key: row.id, label: row.title, value: row.count }))}
                  limit={12}
                  emptyLabel="لا توجد حلقات مرتبطة بسلاسل بعد."
                />
              ) : (
                <SectionError />
              )}
            </div>
          </div>
        </section>

        {/* Publishing activity */}
        <section className="admin-panel mt-6 sm:mt-8" aria-labelledby="stats-publishing-title">
          <div className="admin-panel__head">
            <h3 id="stats-publishing-title" className="admin-panel__title">
              النشر
            </h3>
          </div>
          <div className="p-4 sm:p-5">
            {publishing.ok ? (
              publishing.value.some((bucket) => bucket.count > 0) ? (
                <StatBarList
                  items={publishing.value.map((bucket) => ({
                    key: bucket.month,
                    label: formatArabicMonth(bucket.monthDate),
                    value: bucket.count,
                  }))}
                />
              ) : (
                <EmptyState icon={CalendarDays} title="لا تتوفر بيانات نشر بعد." />
              )
            ) : (
              <SectionError />
            )}
          </div>
        </section>

        {/* Participants */}
        <section className="admin-panel mt-6 sm:mt-8" aria-labelledby="stats-participants-title">
          <div className="admin-panel__head">
            <h3 id="stats-participants-title" className="admin-panel__title">
              المشاركون
            </h3>
          </div>
          <div className="grid gap-6 p-4 sm:p-5 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-bold text-[var(--ink-soft)]">الحلقات حسب المشارك</p>
              {participants.ok ? (
                <StatBarList
                  items={participants.value.byParticipant.map((row) => ({ key: row.id, label: row.name, value: row.count }))}
                  limit={12}
                  emptyLabel="لا يوجد أشخاص مرتبطون بحلقات بعد."
                />
              ) : (
                <SectionError />
              )}
            </div>
            <div>
              <p className="mb-3 text-sm font-bold text-[var(--ink-soft)]">ملخص</p>
              {participants.ok ? (
                <div className="grid grid-cols-2 gap-2">
                  <div className="admin-mini-stat">
                    <b>{formatCount(participants.value.totalPeople, PERSON_FORMS)}</b>
                    <span>في نظام الأشخاص</span>
                  </div>
                  <div className="admin-mini-stat">
                    <b>{participants.value.averagePerEpisode.toFixed(2)}</b>
                    <span>متوسط المشاركين لكل حلقة</span>
                  </div>
                  <div className="admin-mini-stat">
                    <b>{participants.value.episodesWithoutParticipants}</b>
                    <span>حلقة بلا مشاركين</span>
                  </div>
                </div>
              ) : (
                <SectionError />
              )}
            </div>
          </div>
        </section>

        {/* Content completeness */}
        <section className="admin-panel mt-6 sm:mt-8" aria-labelledby="stats-completeness-title">
          <div className="admin-panel__head">
            <h3 id="stats-completeness-title" className="admin-panel__title">
              اكتمال المحتوى
            </h3>
          </div>
          <div className="p-4 sm:p-5">
            {completeness.ok ? (
              completeness.value.total > 0 ? (
                <ContentCompleteness fields={completeness.value.fields} />
              ) : (
                <EmptyState icon={BarChart3} title="لا توجد حلقات منشورة بعد لفحص اكتمالها." />
              )
            ) : (
              <SectionError />
            )}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
