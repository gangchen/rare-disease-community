import { NextResponse } from 'next/server';
import { authenticateUser } from '@/data/users';
import { generateToken } from '@/lib/auth';

// POST /api/auth/login
// Body: { email, password }
export async function POST(request) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: '缺少必填字段: email, password' },
      { status: 400 }
    );
  }

  const user = authenticateUser(email, password);

  if (!user) {
    return NextResponse.json(
      { error: '邮箱或密码错误' },
      { status: 401 }
    );
  }

  const { token, expiresIn } = generateToken(user.id, user.role);

  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    token,
    expiresIn,
  });
}
