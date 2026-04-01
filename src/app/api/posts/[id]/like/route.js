import { toggleLike, isLikedByUser } from '@/data/posts';
import { authenticate } from '@/lib/middleware';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request, { params }) {
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

export async function POST(request, { params }) {
  const auth = await authenticate(request);
  if (!auth) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  const postId = parseInt(params.id);
  const result = toggleLike(postId, auth.userId);
  return NextResponse.json(result);
}
