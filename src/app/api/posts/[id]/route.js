import { NextResponse } from 'next/server';
import { getPostById, incrementViews, updatePost, deletePost } from '@/data/posts';
import { authenticate, authError } from '@/lib/middleware';
import { withLogging } from '@/lib/apiLogger';

// GET /api/posts/:id
async function handleGET(request, { params }) {
  const id = parseInt(params.id);
  const post = getPostById(id);

  if (!post) {
    return NextResponse.json({ error: '帖子不存在' }, { status: 404 });
  }

  incrementViews(id);

  return NextResponse.json(post);
}

// PATCH /api/posts/:id - 编辑帖子（仅作者或管理员）
async function handlePATCH(request, { params }) {
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
async function handleDELETE(request, { params }) {
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

export const GET = withLogging(handleGET, 'posts');
export const PATCH = withLogging(handlePATCH, 'posts');
export const DELETE = withLogging(handleDELETE, 'posts');
