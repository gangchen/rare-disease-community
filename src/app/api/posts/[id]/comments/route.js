import { NextResponse } from 'next/server';
import { getPostById, addComment } from '@/data/posts';
import { authenticate, authError, rateLimit } from '@/lib/middleware';
import { createNotification } from '@/data/notifications';
import { notifyUser } from '@/lib/notificationStream';

// GET /api/posts/:id/comments - 公开接口
export async function GET(request, { params }) {
  const id = parseInt(params.id);
  const post = getPostById(id);

  if (!post) {
    return NextResponse.json({ error: '帖子不存在' }, { status: 404 });
  }

  return NextResponse.json({ items: post.comments, total: post.comments.length });
}

// POST /api/posts/:id/comments - 需要认证
// Header: Authorization: Bearer <token> 或 ApiKey <key>
// Body: { content }
export async function POST(request, { params }) {
  const rateLimited = rateLimit(request, 'write');
  if (rateLimited) return rateLimited;

  const auth = authenticate(request);
  if (auth.error) return authError(auth);

  const id = parseInt(params.id);
  const body = await request.json();
  const { content } = body;

  if (!content) {
    return NextResponse.json(
      { error: '缺少必填字段: content' },
      { status: 400 }
    );
  }

  if (content.length > 5000) {
    return NextResponse.json({ error: '评论不能超过5000字' }, { status: 400 });
  }

  const comment = addComment(id, {
    author: body.author || `user_${auth.userId}`,
    authorId: auth.userId,
    content,
  });

  if (!comment) {
    return NextResponse.json({ error: '帖子不存在' }, { status: 404 });
  }

  // Notify post author
  const post = getPostById(id);
  if (post) {
    const notification = createNotification({
      userId: post.authorId,
      type: 'comment',
      sourceUserId: auth.userId,
      postId: id,
      commentId: comment.id,
    });
    if (notification) {
      notifyUser(post.authorId, { type: 'notification', data: notification });
    }
  }

  return NextResponse.json(comment, { status: 201 });
}
