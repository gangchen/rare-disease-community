import crypto from 'crypto';

// 简易 Token 存储（生产环境应使用 Redis/数据库）
const tokens = new Map();
const apiKeys = new Map();

const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24小时

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

export function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

export function createPasswordHash(password) {
  const salt = generateSalt();
  const hash = hashPassword(password, salt);
  return { salt, hash };
}

export function verifyPassword(password, salt, hash) {
  return hashPassword(password, salt) === hash;
}

// 生成 Bearer Token
export function generateToken(userId, role) {
  const token = crypto.randomBytes(32).toString('hex');
  tokens.set(token, {
    userId,
    role,
    createdAt: Date.now(),
    expiresAt: Date.now() + TOKEN_EXPIRY,
  });
  return { token, expiresIn: TOKEN_EXPIRY / 1000 };
}

// 验证 Bearer Token
export function verifyToken(token) {
  const data = tokens.get(token);
  if (!data) return null;
  if (Date.now() > data.expiresAt) {
    tokens.delete(token);
    return null;
  }
  return data;
}

// 撤销 Token
export function revokeToken(token) {
  return tokens.delete(token);
}

// 生成 API Key（给 agent 使用的长期密钥）
export function generateApiKey(userId, name, role) {
  const key = `rdc_${crypto.randomBytes(24).toString('hex')}`;
  apiKeys.set(key, {
    userId,
    name,
    role,
    createdAt: Date.now(),
    active: true,
  });
  return key;
}

// 验证 API Key
export function verifyApiKey(key) {
  const data = apiKeys.get(key);
  if (!data || !data.active) return null;
  return data;
}

// 列出用户的 API Keys
export function listApiKeys(userId) {
  const keys = [];
  for (const [key, data] of apiKeys.entries()) {
    if (data.userId === userId) {
      keys.push({
        key: key.slice(0, 8) + '...' + key.slice(-4),
        name: data.name,
        createdAt: data.createdAt,
        active: data.active,
      });
    }
  }
  return keys;
}

// 撤销 API Key
export function revokeApiKey(key) {
  const data = apiKeys.get(key);
  if (!data) return false;
  data.active = false;
  return true;
}
