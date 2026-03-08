/**
 * Notifications API - List, read, mark as read.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllNotifications, getUnreadCount, markAsRead, markAllAsRead } from "@/lib/notifications";

// GET /api/notifications - List notifications
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id!;

    const [notifs, unread] = await Promise.all([
      getAllNotifications(userId),
      getUnreadCount(userId),
    ]);

    return NextResponse.json({ notifications: notifs, unreadCount: unread });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/notifications - Mark as read
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { notificationId, markAll } = body;

    const userId = session.user.id!;

    if (markAll) {
      await markAllAsRead(userId);
    } else if (notificationId) {
      await markAsRead(notificationId);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
