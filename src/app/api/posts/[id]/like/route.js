import { toggleLike, isLikedByUser, getPostById } from '@/data/posts';
import { authenticate } from '@/lib/middleware';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { createNotification } from '@/data/notifications';
import { notifyUser } from '@/lib/notificationStream';
import { withLogging } from '@/lib/apiLogger';

async function handleGET(request, { params }) {
  const postId = parseInt(params.id);
  const db = getDb();
  const count = db.prepare('SELECT COUNT(*) AS c FROM likes WHERE post_id = ?').get(postId).c;

  let liked = false;
  const auth = await authenticate(request);
  if (auth) {
    liked = isLikedByUser(postId, auth.userId);
  }

  return NextResponse.json({ count, liked });
}

async function handlePOST(request, { params }) {
  const auth = await authenticate(request);
  if (!auth) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  const postId = parseInt(params.id);
  const result = toggleLike(postId, auth.userId);

  // Notify post author on like (not unlike)
  if (result.liked) {
    const post = getPostById(postId);
    if (post) {
      const notification = createNotification({
        userId: post.authorId,
        type: 'like',
        sourceUserId: auth.userId,
        postId,
      });
      if (notification) {
        notifyUser(post.authorId, { type: 'notification', data: notification });
      }
    }
  }

  return NextResponse.json(result);
}

export const GET = withLogging(handleGET, 'posts');
export const POST = withLogging(handlePOST, 'posts');
