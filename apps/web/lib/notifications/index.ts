/**
 * Notification service - create, read, manage notifications.
 */
import { db } from "@/lib/db";
import { notifications } from "@/lib/schema";
import { eq, desc, and } from "drizzle-orm";

export type NotificationType =
  | "post_published"
  | "post_failed"
  | "approval_needed"
  | "approval_granted"
  | "team_invite"
  | "analytics_alert"
  | "automation_failed";

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  data?: Record<string, any>;
}

export async function createNotification(params: CreateNotificationParams): Promise<string> {
  const [notification] = await db
    .insert(notifications)
    .values({
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      data: params.data,
    })
    .returning({ id: notifications.id });

  return notification.id;
}

export async function getUnreadNotifications(userId: string, limit = 20) {
  return db
    .select()
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getAllNotifications(userId: string, limit = 50) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getUnreadCount(userId: string): Promise<number> {
  const unread = await db
    .select()
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  return unread.length;
}

export async function markAsRead(notificationId: string): Promise<void> {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, notificationId));
}

export async function markAllAsRead(userId: string): Promise<void> {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.userId, userId));
}
