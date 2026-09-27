import type { ReactNode } from "react";
import { EpisodeThumbnail } from "@/components/content/episode-thumbnail";

/**
 * The shared "episode card" row: thumbnail + badges/title/meta + a trailing
 * action. Used for both the admin episode list (via EpisodeRow) and the
 * episode editor's read-only YouTube-source panel, so the two `.admin-row`
 * flex-vs-grid variants live in one place instead of two copies of the same
 * markup drifting apart.
 *
 * Composes `.admin-row` (shared hover/divider/padding with the many other
 * admin list rows) with the `.admin-media-row` modifier, which is what
 * switches this specific row to a stacked grid below 640px -- see admin.css.
 */
export function AdminMediaRow({
  thumbnailUrl,
  title,
  badges,
  meta,
  action,
}: {
  thumbnailUrl: string | null;
  title: string;
  badges?: ReactNode;
  meta: ReactNode;
  action: ReactNode;
}) {
  return (
    <div className="admin-row admin-media-row">
      <div className="admin-thumb">
        {thumbnailUrl && <EpisodeThumbnail src={thumbnailUrl} alt="" fill sizes="128px" className="object-cover" />}
      </div>
      <div className="admin-media-row__body">
        {badges && <div className="admin-media-row__badges">{badges}</div>}
        <p className="admin-row__title">{title}</p>
        <p className="meta">{meta}</p>
      </div>
      <div className="admin-media-row__action">{action}</div>
    </div>
  );
}
