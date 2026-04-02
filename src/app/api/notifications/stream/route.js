import { verifyApiKey, verifyToken } from '@/lib/auth';
import { addStream, removeStream } from '@/lib/notificationStream';
import { getUnreadCount } from '@/data/notifications';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const apiKey = searchParams.get('apiKey');
  const token = searchParams.get('token');

  let auth = null;
  if (apiKey) auth = verifyApiKey(apiKey);
  else if (token) auth = verifyToken(token);

  if (!auth) {
    return new Response(JSON.stringify({ error: '认证失败' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userId = auth.userId;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      addStream(userId, controller);

      // Send initial unread count
      const unread = getUnreadCount(userId);
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'init', unreadCount: unread })}\n\n`));

      // Heartbeat every 30s
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          clearInterval(heartbeat);
          removeStream(userId, controller);
        }
      }, 30000);

      // Store cleanup ref
      controller._cleanup = () => {
        clearInterval(heartbeat);
        removeStream(userId, controller);
      };
    },
    cancel(controller) {
      if (controller?._cleanup) controller._cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
