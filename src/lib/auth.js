import crypto from 'crypto';
import { getDb } from '@/lib/db';

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

// 清理过期 Token
function cleanExpiredTokens() {
  const db = getDb();
  db.prepare('DELETE FROM tokens WHERE expires_at < ?').run(Date.now());
}

// 生成 Bearer Token
export function generateToken(userId, role) {
  const db = getDb();
  cleanExpiredTokens();
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  db.prepare(
    'INSERT INTO tokens (token, user_id, role, created_at, expires_at) VALUES (?, ?, ?, ?, ?)'
  ).run(token, userId, role, now, now + TOKEN_EXPIRY);
  return { token, expiresIn: TOKEN_EXPIRY / 1000 };
}

// 验证 Bearer Token
export function verifyToken(token) {
  const db = getDb();
  const row = db.prepare('SELECT user_id AS userId, role, expires_at AS expiresAt FROM tokens WHERE token = ?').get(token);
  if (!row) return null;
  if (Date.now() > row.expiresAt) {
    db.prepare('DELETE FROM tokens WHERE token = ?').run(token);
    return null;
  }
  return { userId: row.userId, role: row.role };
}

// 撤销 Token
export function revokeToken(token) {
  const db = getDb();
  const result = db.prepare('DELETE FROM tokens WHERE token = ?').run(token);
  return result.changes > 0;
}

// 生成 API Key
export function generateApiKey(userId, name, role) {
  const db = getDb();
  const key = `rdc_${crypto.randomBytes(24).toString('hex')}`;
  db.prepare(
    'INSERT INTO api_keys (key, user_id, name, role, created_at, active) VALUES (?, ?, ?, ?, ?, 1)'
  ).run(key, userId, name, role, Date.now());
  return key;
}

// 验证 API Key
export function verifyApiKey(key) {
  const db = getDb();
  const row = db.prepare(
    'SELECT user_id AS userId, name, role FROM api_keys WHERE key = ? AND active = 1'
  ).get(key);
  return row || null;
}

// 列出用户的 API Keys
export function listApiKeys(userId) {
  const db = getDb();
  const rows = db.prepare(
    'SELECT key, name, created_at AS createdAt, active FROM api_keys WHERE user_id = ? ORDER BY created_at DESC'
  ).all(userId);
  return rows.map((r) => ({
    key: r.key.slice(0, 8) + '...' + r.key.slice(-4),
    name: r.name,
    createdAt: r.createdAt,
    active: !!r.active,
  }));
}

// 撤销 API Key
export function revokeApiKey(key) {
  const db = getDb();
  const result = db.prepare('UPDATE api_keys SET active = 0 WHERE key = ?').run(key);
  return result.changes > 0;
}
