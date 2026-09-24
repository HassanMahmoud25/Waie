/** Shaped after the Prisma `Notification` model (see prisma/schema.prisma). */
export type AppNotification = {
  id: string;
  type: "NEW_EPISODE";
  title: string;
  message: string;
  href: string;
  /** ISO 8601 timestamp of read state, or null while unread. */
  readAt: string | null;
  /** ISO 8601 timestamp -- serializable across the server/client boundary. */
  createdAt: string;
  /**
   * Resolved from the notification's `episodeId` relation in the same query
   * that loads the notification (see lib/notifications/queries.ts) -- never a
   * separate per-notification fetch. Null for a notification whose episode
   * was since deleted (the row itself is cascade-deleted, so in practice this
   * is only ever non-null) or, for a future non-NEW_EPISODE type, absent.
   */
  episode: { thumbnailUrl: string; title: string; seriesTitle: string | null } | null;
};
