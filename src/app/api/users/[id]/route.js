import { NextResponse } from 'next/server';
import { getUserById, updateUser } from '@/data/users';

// GET /api/users/:id
export async function GET(request, { params }) {
  const id = parseInt(params.id);
  const user = getUserById(id);

  if (!user) {
    return NextResponse.json({ error: '用户不存在' }, { status: 404 });
  }

  const { email, ...publicUser } = user;
  return NextResponse.json(publicUser);
}

// PATCH /api/users/:id
// Body: { username?, bio?, diseaseIds? }
export async function PATCH(request, { params }) {
  const id = parseInt(params.id);
  const body = await request.json();

  const user = updateUser(id, body);

  if (!user) {
    return NextResponse.json({ error: '用户不存在' }, { status: 404 });
  }

  const { email, ...publicUser } = user;
  return NextResponse.json(publicUser);
}
