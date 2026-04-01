import { NextResponse } from 'next/server';
import { generateApiKey, listApiKeys, revokeApiKey } from '@/lib/auth';
import { authenticate, requireRole, authError } from '@/lib/middleware';

// GET /api/auth/apikeys - 列出当前用户的 API Keys
export async function GET(request) {
  const auth = authenticate(request);
  if (auth.error) return authError(auth);

  const keys = listApiKeys(auth.userId);
  return NextResponse.json({ items: keys });
}

// POST /api/auth/apikeys - 创建新的 API Key
// Body: { name: "my-agent" }
export async function POST(request) {
  const auth = authenticate(request);
  if (auth.error) return authError(auth);

  const body = await request.json();
  const { name } = body;

  if (!name) {
    return NextResponse.json(
      { error: '请提供 API Key 名称 (name)' },
      { status: 400 }
    );
  }

  const key = generateApiKey(auth.userId, name, auth.role);

  return NextResponse.json({
    key,
    name,
    message: '请妥善保存此 API Key，它只会显示一次',
    usage: 'Authorization: ApiKey <your-key>',
  }, { status: 201 });
}

// DELETE /api/auth/apikeys - 撤销 API Key
// Body: { key: "rdc_..." }
export async function DELETE(request) {
  const auth = authenticate(request);
  if (auth.error) return authError(auth);

  const body = await request.json();
  const { key } = body;

  if (!key) {
    return NextResponse.json({ error: '请提供要撤销的 API Key' }, { status: 400 });
  }

  const revoked = revokeApiKey(key);
  if (!revoked) {
    return NextResponse.json({ error: 'API Key 不存在' }, { status: 404 });
  }

  return NextResponse.json({ message: 'API Key 已撤销' });
}
