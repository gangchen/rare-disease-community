import { NextResponse } from 'next/server';
import { authenticate, authError } from '@/lib/middleware';
import { getNotifications, markAsRead } from '@/data/notifications';

// GET /api/notifications
export async function GET(request) {
  const auth = authenticate(request);
  if (auth.error) return authError(auth);

  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get('unreadOnly') === 'true';
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  const result = getNotifications(auth.userId, { unreadOnly, limit, offset });
  return NextResponse.json(result);
}

// PATCH /api/notifications - mark as read
export async function PATCH(request) {
  const auth = authenticate(request);
  if (auth.error) return authError(auth);

  const body = await request.json();
  const { notificationIds } = body; // optional array; omit to mark all

  markAsRead(auth.userId, notificationIds);
  return NextResponse.json({ success: true });
}
