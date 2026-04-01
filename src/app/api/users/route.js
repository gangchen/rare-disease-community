import { NextResponse } from 'next/server';
import { getAllUsers, createUser } from '@/data/users';

// GET /api/users
// 查询参数: ?page=1&limit=10&role=user|expert|admin
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const role = searchParams.get('role') || undefined;

  const result = getAllUsers({ page, limit, role });
  return NextResponse.json(result);
}

// POST /api/users
// Body: { username, email, role?, diseaseIds?, bio? }
export async function POST(request) {
  const body = await request.json();
  const { username, email } = body;

  if (!username || !email) {
    return NextResponse.json(
      { error: '缺少必填字段: username, email' },
      { status: 400 }
    );
  }

  const result = createUser(body);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  return NextResponse.json(result, { status: 201 });
}
