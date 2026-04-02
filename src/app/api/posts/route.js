import { NextResponse } from 'next/server';
import { getAllPosts, createPost, searchPosts } from '@/data/posts';
import { authenticate, authError } from '@/lib/middleware';

// GET /api/posts - 公开接口
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
  const category = searchParams.get('category') || undefined;
  const sort = searchParams.get('sort') || 'date';

  const result = getAllPosts({ page, limit, diseaseId, category, sort });
  return NextResponse.json(result);
}

// POST /api/posts - 需要认证
// Header: Authorization: Bearer <token> 或 ApiKey <key>
// Body: { title, content, diseaseId?, disease? }
export async function POST(request) {
  const auth = authenticate(request);
  if (auth.error) return authError(auth);

  const body = await request.json();
  const { title, content } = body;

  if (!title || !content) {
    return NextResponse.json(
      { error: '缺少必填字段: title, content' },
      { status: 400 }
    );
  }

  const post = createPost({
    ...body,
    authorId: auth.userId,
    author: body.author || `user_${auth.userId}`,
  });
  return NextResponse.json(post, { status: 201 });
}
