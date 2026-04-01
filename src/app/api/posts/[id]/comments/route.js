import { NextResponse } from 'next/server';
import { getPostById, addComment } from '@/data/posts';

// GET /api/posts/:id/comments
export async function GET(request, { params }) {
  const id = parseInt(params.id);
  const post = getPostById(id);

  if (!post) {
    return NextResponse.json({ error: '帖子不存在' }, { status: 404 });
  }

  return NextResponse.json({ items: post.comments, total: post.comments.length });
}

// POST /api/posts/:id/comments
// Body: { author, authorId, content }
export async function POST(request, { params }) {
  const id = parseInt(params.id);
  const body = await request.json();
  const { author, authorId, content } = body;

  if (!author || !authorId || !content) {
    return NextResponse.json(
      { error: '缺少必填字段: author, authorId, content' },
      { status: 400 }
    );
  }

  const comment = addComment(id, { author, authorId, content });

  if (!comment) {
    return NextResponse.json({ error: '帖子不存在' }, { status: 404 });
  }

  return NextResponse.json(comment, { status: 201 });
}
