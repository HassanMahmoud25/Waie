import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser, LOGIN_PATH } from "@/lib/auth/server";
import { getNotifications } from "@/lib/notifications/queries";
import { NotificationsList } from "@/components/notifications/notifications-list";

export const metadata: Metadata = { title: "الإشعارات" };

/**
 * Notifications are purely authenticated (no anonymous/localStorage fallback,
 * unlike /library) -- a signed-out visitor is sent to /login rather than
 * shown an empty authenticated-looking page.
 */
export default async function NotificationsPage() {
  const user = await getSessionUser();
  if (!user) redirect(LOGIN_PATH);

  const notifications = await getNotifications();

  return (
    <main className="container py-14">
      <p className="eyebrow-pill w-fit">إشعاراتك</p>
      <h1 className="mt-4 text-2xl font-black leading-[1.8] tracking-[-.03em] md:text-3xl">الإشعارات</h1>

      <div className="mt-8 max-w-xl">
        <NotificationsList initialNotifications={notifications} />
      </div>
    </main>
  );
}
