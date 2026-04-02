import { getDb } from '@/lib/db';

export function createNotification({ userId, type, sourceUserId, postId, commentId, data }) {
  // Don't notify yourself
  if (userId === sourceUserId) return null;

  const db = getDb();
  const now = new Date().toISOString().split('T')[0];
  const result = db.prepare(
    'INSERT INTO notifications (user_id, type, source_user_id, post_id, comment_id, data, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, ?)'
  ).run(userId, type, sourceUserId, postId, commentId || null, JSON.stringify(data || {}), now);

  return db.prepare(`
    SELECT n.id, n.type, n.post_id AS postId, n.comment_id AS commentId, n.is_read AS isRead, n.created_at AS date, n.data,
           u.username AS sourceUser, p.title AS postTitle
    FROM notifications n
    JOIN users u ON n.source_user_id = u.id
    JOIN posts p ON n.post_id = p.id
    WHERE n.id = ?
  `).get(result.lastInsertRowid);
}

export function getNotifications(userId, { unreadOnly = false, limit = 20, offset = 0 } = {}) {
  const db = getDb();
  const where = unreadOnly ? 'AND n.is_read = 0' : '';

  const total = db.prepare(
    `SELECT COUNT(*) AS c FROM notifications n WHERE n.user_id = ? ${where}`
  ).get(userId).c;

  const unreadCount = db.prepare(
    'SELECT COUNT(*) AS c FROM notifications WHERE user_id = ? AND is_read = 0'
  ).get(userId).c;

  const items = db.prepare(`
    SELECT n.id, n.type, n.post_id AS postId, n.comment_id AS commentId, n.is_read AS isRead, n.created_at AS date, n.data,
           u.username AS sourceUser, p.title AS postTitle
    FROM notifications n
    JOIN users u ON n.source_user_id = u.id
    JOIN posts p ON n.post_id = p.id
    WHERE n.user_id = ? ${where}
    ORDER BY n.created_at DESC
    LIMIT ? OFFSET ?
  `).all(userId, limit, offset);

  return { items, total, unreadCount };
}

export function markAsRead(userId, notificationIds) {
  const db = getDb();
  if (notificationIds && notificationIds.length > 0) {
    const placeholders = notificationIds.map(() => '?').join(',');
    db.prepare(
      `UPDATE notifications SET is_read = 1 WHERE user_id = ? AND id IN (${placeholders})`
    ).run(userId, ...notificationIds);
  } else {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(userId);
  }
}

export function getUnreadCount(userId) {
  const db = getDb();
  return db.prepare('SELECT COUNT(*) AS c FROM notifications WHERE user_id = ? AND is_read = 0').get(userId).c;
}
