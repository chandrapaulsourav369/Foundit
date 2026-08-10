import {
  Notification,
  NotificationDocument,
  NotificationType,
} from '#models/notification.model.ts';

export type PublicNotification = Omit<NotificationDocument, '_id'>;

function toPublicNotification(
  doc: NotificationDocument
): PublicNotification {
  const { _id, ...rest } = doc;
  return rest;
}

function encodeCursor(createdAt: Date, id: string): string {
  return Buffer.from(`${createdAt.toISOString()}_${id}`).toString(
    'base64url'
  );
}

function decodeCursor(cursor: string): { createdAt: Date; id: string } {
  const decoded = Buffer.from(cursor, 'base64url').toString('utf-8');
  const separatorIndex = decoded.lastIndexOf('_');
  return {
    createdAt: new Date(decoded.slice(0, separatorIndex)),
    id: decoded.slice(separatorIndex + 1),
  };
}

export async function createNotification(data: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string | null;
}): Promise<void> {
  await Notification.create({ ...data, link: data.link ?? null });
}

export async function listNotifications(
  userId: string,
  { cursor, limit = 20 }: { cursor?: string; limit?: number }
): Promise<{
  notifications: PublicNotification[];
  nextCursor: string | null;
  unreadCount: number;
}> {
  const filter: Record<string, unknown> = { userId };
  if (cursor) {
    const { createdAt, id } = decodeCursor(cursor);
    filter.$or = [
      { createdAt: { $lt: createdAt } },
      { createdAt, _id: { $lt: id } },
    ];
  }

  const [docs, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1),
    Notification.countDocuments({ userId, isRead: false }),
  ]);

  const hasMore = docs.length > limit;
  const page = hasMore ? docs.slice(0, limit) : docs;
  const last = page[page.length - 1];

  return {
    notifications: page.map(doc => toPublicNotification(doc.toObject())),
    nextCursor: hasMore && last ? encodeCursor(last.createdAt, last.id) : null,
    unreadCount,
  };
}

export async function markNotificationRead(
  id: string,
  userId: string
): Promise<boolean> {
  const result = await Notification.updateOne(
    { _id: id, userId },
    { isRead: true }
  );
  return result.matchedCount > 0;
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await Notification.updateMany({ userId, isRead: false }, { isRead: true });
}
