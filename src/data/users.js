import { getDb } from '@/lib/db';
import { createPasswordHash, verifyPassword } from '@/lib/auth';

function getDiseaseIds(userId) {
  const db = getDb();
  return db.prepare('SELECT disease_id FROM user_diseases WHERE user_id = ?').all(userId).map((r) => r.disease_id);
}

function setDiseaseIds(userId, diseaseIds) {
  const db = getDb();
  db.prepare('DELETE FROM user_diseases WHERE user_id = ?').run(userId);
  const insert = db.prepare('INSERT INTO user_diseases (user_id, disease_id) VALUES (?, ?)');
  for (const did of diseaseIds) {
    insert.run(userId, did);
  }
}

function toPublic(row) {
  if (!row) return null;
  const { password, salt, join_date, ...rest } = row;
  return {
    ...rest,
    joinDate: join_date,
    diseaseIds: getDiseaseIds(row.id),
  };
}

export function getAllUsers({ page = 1, limit = 10, role } = {}) {
  const db = getDb();

  let where = '';
  const params = [];
  if (role) {
    where = 'WHERE role = ?';
    params.push(role);
  }

  const countRow = db.prepare(`SELECT COUNT(*) AS total FROM users ${where}`).get(...params);
  const total = countRow.total;

  const rows = db.prepare(
    `SELECT id, username, email, role, join_date, bio FROM users ${where} ORDER BY id LIMIT ? OFFSET ?`
  ).all(...params, limit, (page - 1) * limit);

  const items = rows.map((r) => ({
    ...r,
    joinDate: r.join_date,
    join_date: undefined,
    diseaseIds: getDiseaseIds(r.id),
  }));

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export function getUserById(id) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  return toPublic(row);
}

export function getUserByUsername(username) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  return toPublic(row);
}

export function getUserByEmail(email) {
  const db = getDb();
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email) || null;
}

export function authenticateUser(email, password) {
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return null;
  if (!verifyPassword(password, user.salt, user.password)) return null;
  return user;
}

export function createUser({ username, email, password, role = 'user', diseaseIds = [], bio = '' }) {
  const db = getDb();

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return { error: '邮箱已注册' };

  const existingName = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existingName) return { error: '用户名已存在' };

  const pwd = createPasswordHash(password);
  const now = new Date().toISOString().split('T')[0];

  const result = db.prepare(
    'INSERT INTO users (username, email, password, salt, role, join_date, bio) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(username, email, pwd.hash, pwd.salt, role, now, bio);

  const userId = result.lastInsertRowid;
  if (diseaseIds.length > 0) {
    setDiseaseIds(userId, diseaseIds);
  }

  return getUserById(userId);
}

export function updateUser(id, updates) {
  const db = getDb();
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
  if (!user) return null;

  if (updates.username !== undefined) {
    db.prepare('UPDATE users SET username = ? WHERE id = ?').run(updates.username, id);
  }
  if (updates.bio !== undefined) {
    db.prepare('UPDATE users SET bio = ? WHERE id = ?').run(updates.bio, id);
  }
  if (updates.diseaseIds !== undefined) {
    setDiseaseIds(id, updates.diseaseIds);
  }

  return getUserById(id);
}
