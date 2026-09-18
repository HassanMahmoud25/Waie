import { redirect } from "next/navigation";

/** Old placeholder route -- kept as a redirect so any existing link still lands on the real sync dashboard. */
export default function AdminSyncRedirect() {
  redirect("/admin/sync/youtube");
}
