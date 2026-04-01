import { NextResponse } from 'next/server';
import { getAllPosts, createPost, searchPosts } from '@/data/posts';

// GET /api/posts
// 查询参数: ?page=1&limit=10&diseaseId=2&sort=date|views|replies&search=关键词
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');

  if (search) {
    const results = searchPosts(search);
    return NextResponse.json({ items: results, total: results.length });
  }

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const diseaseId = searchParams.get('diseaseId') ? parseInt(searchParams.get('diseaseId')) : undefined;
  const sort = searchParams.get('sort') || 'date';

  const result = getAllPosts({ page, limit, diseaseId, sort });
  return NextResponse.json(result);
}

// POST /api/posts
// Body: { title, content, author, authorId, diseaseId?, disease? }
export async function POST(request) {
  const body = await request.json();
  const { title, content, author, authorId } = body;

  if (!title || !content || !author || !authorId) {
    return NextResponse.json(
      { error: '缺少必填字段: title, content, author, authorId' },
      { status: 400 }
    );
  }

  const post = createPost(body);
  return NextResponse.json(post, { status: 201 });
}
