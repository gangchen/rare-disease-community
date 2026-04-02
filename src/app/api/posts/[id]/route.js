import { NextResponse } from 'next/server';
import { getPostById, incrementViews, updatePost, deletePost } from '@/data/posts';
import { authenticate, authError } from '@/lib/middleware';

// GET /api/posts/:id
export async function GET(request, { params }) {
  const id = parseInt(params.id);
  const post = getPostById(id);

  if (!post) {
    return NextResponse.json({ error: '帖子不存在' }, { status: 404 });
  }

  incrementViews(id);

  return NextResponse.json(post);
}

// PATCH /api/posts/:id - 编辑帖子（仅作者或管理员）
export async function PATCH(request, { params }) {
  const auth = authenticate(request);
  if (auth.error) return authError(auth);

  const id = parseInt(params.id);
  const post = getPostById(id);
  if (!post) {
    return NextResponse.json({ error: '帖子不存在' }, { status: 404 });
  }

  if (post.authorId !== auth.userId && auth.role !== 'admin') {
    return NextResponse.json({ error: '只能编辑自己的帖子' }, { status: 403 });
  }

  const body = await request.json();
  const updated = updatePost(id, body);
  return NextResponse.json(updated);
}

// DELETE /api/posts/:id - 删除帖子（仅作者或管理员）
export async function DELETE(request, { params }) {
  const auth = authenticate(request);
  if (auth.error) return authError(auth);

  const id = parseInt(params.id);
  const post = getPostById(id);
  if (!post) {
    return NextResponse.json({ error: '帖子不存在' }, { status: 404 });
  }

  if (post.authorId !== auth.userId && auth.role !== 'admin') {
    return NextResponse.json({ error: '只能删除自己的帖子' }, { status: 403 });
  }

  deletePost(id);
  return NextResponse.json({ message: '帖子已删除' });
}
