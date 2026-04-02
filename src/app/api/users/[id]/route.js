import { NextResponse } from 'next/server';
import { getUserById, updateUser } from '@/data/users';
import { authenticate, authError } from '@/lib/middleware';
import { withLogging } from '@/lib/apiLogger';

// GET /api/users/:id - 需要认证
async function handleGET(request, { params }) {
  const auth = authenticate(request);
  if (auth.error) return authError(auth);

  const id = parseInt(params.id);
  const user = getUserById(id);

  if (!user) {
    return NextResponse.json({ error: '用户不存在' }, { status: 404 });
  }

  return NextResponse.json(user);
}

// PATCH /api/users/:id - 需要认证（只能改自己的，admin可改任何人）
// Body: { username?, bio?, diseaseIds? }
async function handlePATCH(request, { params }) {
  const auth = authenticate(request);
  if (auth.error) return authError(auth);

  const id = parseInt(params.id);

  if (auth.userId !== id && auth.role !== 'admin') {
    return NextResponse.json({ error: '只能修改自己的资料' }, { status: 403 });
  }

  const body = await request.json();
  const user = updateUser(id, body);

  if (!user) {
    return NextResponse.json({ error: '用户不存在' }, { status: 404 });
  }

  return NextResponse.json(user);
}

export const GET = withLogging(handleGET, 'users');
export const PATCH = withLogging(handlePATCH, 'users');
