import { NextResponse } from 'next/server';
import { verifyToken, verifyApiKey } from '@/lib/auth';
import { checkRateLimit, getClientId, RATE_LIMITS } from '@/lib/rateLimit';

// 从请求中提取认证信息并验证
export function authenticate(request) {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader) {
    return { error: '未提供认证信息，请在 Authorization 头中传入 Bearer token 或 ApiKey', status: 401 };
  }

  // Bearer Token 认证
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const data = verifyToken(token);
    if (!data) {
      return { error: 'Token 无效或已过期', status: 401 };
    }
    return { userId: data.userId, role: data.role };
  }

  // API Key 认证（给 agent 使用）
  if (authHeader.startsWith('ApiKey ')) {
    const key = authHeader.slice(7);
    const data = verifyApiKey(key);
    if (!data) {
      return { error: 'API Key 无效或已停用', status: 401 };
    }
    return { userId: data.userId, role: data.role };
  }

  return { error: '认证格式无效，请使用 "Bearer <token>" 或 "ApiKey <key>"', status: 401 };
}

// 检查是否有指定角色权限
export function requireRole(auth, ...roles) {
  if (auth.error) return auth;
  if (!roles.includes(auth.role)) {
    return { error: `需要以下角色之一: ${roles.join(', ')}`, status: 403 };
  }
  return auth;
}

// 快捷方法：返回认证错误响应
export function authError(auth) {
  return NextResponse.json({ error: auth.error }, { status: auth.status });
}

// 检查请求频率限制
export function rateLimit(request, type = 'read') {
  const clientId = getClientId(request);
  const config = RATE_LIMITS[type] || RATE_LIMITS.read;
  const result = checkRateLimit(`${type}:${clientId}`, config);
  if (!result.allowed) {
    return NextResponse.json(
      { error: '请求过于频繁，请稍后再试' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(result.resetMs / 1000)),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }
  return null;
}
