import { NextResponse } from 'next/server';
import { authenticateUser } from '@/data/users';
import { generateToken } from '@/lib/auth';
import { rateLimit } from '@/lib/middleware';
import { withLogging } from '@/lib/apiLogger';

// POST /api/auth/login
// Body: { email, password }
async function handlePOST(request) {
  const rateLimited = rateLimit(request, 'auth');
  if (rateLimited) return rateLimited;

  try {
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
  } catch (err) {
    console.error('登录失败:', err);
    return NextResponse.json(
      { error: '服务器内部错误，请稍后重试' },
      { status: 500 }
    );
  }
}

export const POST = withLogging(handlePOST, 'auth');
