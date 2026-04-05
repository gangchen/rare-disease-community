import { getDb } from '@/lib/db';
import crypto from 'crypto';

/**
 * Ensure agent tables exist (safe to call multiple times).
 */
export function ensureAgentTables() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER,
      title TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      tool_calls TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_chat_msg_session ON chat_messages(session_id, created_at);
  `);

  // Add gene2ai_key to users table if not exists
  try {
    db.prepare("SELECT gene2ai_key FROM users LIMIT 0").run();
  } catch {
    db.exec("ALTER TABLE users ADD COLUMN gene2ai_key TEXT");
  }
}

/**
 * Create or get a chat session.
 */
export function getOrCreateSession(sessionId, userId) {
  const db = getDb();
  const now = new Date().toISOString();

  if (sessionId) {
    const session = db.prepare('SELECT * FROM chat_sessions WHERE id = ?').get(sessionId);
    if (session) {
      db.prepare('UPDATE chat_sessions SET updated_at = ? WHERE id = ?').run(now, sessionId);
      return session;
    }
  }

  const id = sessionId || crypto.randomUUID();
  db.prepare('INSERT INTO chat_sessions (id, user_id, title, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').run(
    id, userId || null, null, now, now
  );
  return { id, user_id: userId, title: null, created_at: now, updated_at: now };
}

/**
 * Get recent messages for a session.
 */
export function getSessionHistory(sessionId, limit = 20) {
  const db = getDb();
  return db.prepare(
    'SELECT role, content FROM chat_messages WHERE session_id = ? AND role IN (\'user\', \'assistant\') AND content != \'\' ORDER BY created_at DESC LIMIT ?'
  ).all(sessionId, limit).reverse();
}

/**
 * Save a message to the database.
 */
export function saveMessage(sessionId, role, content, toolCalls = null) {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(
    'INSERT INTO chat_messages (session_id, role, content, tool_calls, created_at) VALUES (?, ?, ?, ?, ?)'
  ).run(sessionId, role, content, toolCalls ? JSON.stringify(toolCalls) : null, now);

  // Update session title from first user message
  if (role === 'user') {
    const session = db.prepare('SELECT title FROM chat_sessions WHERE id = ?').get(sessionId);
    if (!session?.title) {
      const title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
      db.prepare('UPDATE chat_sessions SET title = ?, updated_at = ? WHERE id = ?').run(title, now, sessionId);
    }
  }
}

/**
 * Get user's Gene2AI API key.
 */
export function getGene2aiKey(userId) {
  if (!userId) return null;
  const db = getDb();
  const row = db.prepare('SELECT gene2ai_key FROM users WHERE id = ?').get(userId);
  return row?.gene2ai_key || null;
}

/**
 * Save user's Gene2AI API key.
 */
export function setGene2aiKey(userId, key) {
  const db = getDb();
  db.prepare('UPDATE users SET gene2ai_key = ? WHERE id = ?').run(key || null, userId);
}

/**
 * Get user's chat sessions.
 */
export function getUserSessions(userId, limit = 20) {
  const db = getDb();
  return db.prepare(
    'SELECT id, title, created_at, updated_at FROM chat_sessions WHERE user_id = ? ORDER BY updated_at DESC LIMIT ?'
  ).all(userId, limit);
}
