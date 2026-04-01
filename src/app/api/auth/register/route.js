import { NextResponse } from 'next/server';
import { createUser } from '@/data/users';
import { generateToken } from '@/lib/auth';

// POST /api/auth/register
// Body: { username, email, password, role?, diseaseIds?, bio? }
export async function POST(request) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: '缺少必填字段: username, email, password' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度不能少于6位' },
        { status: 400 }
      );
    }

    const user = createUser(body);

    if (user.error) {
      return NextResponse.json({ error: user.error }, { status: 409 });
    }

    const { token, expiresIn } = generateToken(user.id, user.role);

    return NextResponse.json({
      user,
      token,
      expiresIn,
    }, { status: 201 });
  } catch (err) {
    console.error('注册失败:', err);
    return NextResponse.json(
      { error: '服务器内部错误，请稍后重试' },
      { status: 500 }
    );
  }
}
