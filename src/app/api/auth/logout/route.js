import { NextResponse } from 'next/server';
import { revokeToken } from '@/lib/auth';
import { withLogging } from '@/lib/apiLogger';

// POST /api/auth/logout
// Header: Authorization: Bearer <token>
async function handlePOST(request) {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: '未提供 Token' }, { status: 401 });
  }

  const token = authHeader.slice(7);
  revokeToken(token);

  return NextResponse.json({ message: '已退出登录' });
}

export const POST = withLogging(handlePOST, 'auth');
