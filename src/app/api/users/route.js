import { NextResponse } from 'next/server';
import { getAllUsers } from '@/data/users';
import { authenticate, requireRole, authError } from '@/lib/middleware';

// GET /api/users - 需要认证
// Header: Authorization: Bearer <token> 或 ApiKey <key>
// 查询参数: ?page=1&limit=10&role=user|expert|admin
export async function GET(request) {
  const auth = authenticate(request);
  if (auth.error) return authError(auth);

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const role = searchParams.get('role') || undefined;

  const result = getAllUsers({ page, limit, role });
  return NextResponse.json(result);
}
