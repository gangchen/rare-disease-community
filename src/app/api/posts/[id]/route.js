import { NextResponse } from 'next/server';
import { getPostById } from '@/data/posts';

// GET /api/posts/:id
export async function GET(request, { params }) {
  const id = parseInt(params.id);
  const post = getPostById(id);

  if (!post) {
    return NextResponse.json({ error: '帖子不存在' }, { status: 404 });
  }

  return NextResponse.json(post);
}
