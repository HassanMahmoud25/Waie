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
};
