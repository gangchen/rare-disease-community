import { getDb } from '@/lib/db';

export function getAllNews({ page = 1, limit = 10, category } = {}) {
  const db = getDb();

  let where = '';
  const params = [];
  if (category) {
    where = 'WHERE n.category = ?';
    params.push(category);
  }

  const countRow = db.prepare(`SELECT COUNT(*) AS total FROM news n ${where}`).get(...params);
  const total = countRow.total;

  const rows = db.prepare(`
    SELECT n.id, n.title, n.summary, n.content, n.category, n.image_url AS imageUrl,
           u.username AS author, n.author_id AS authorId, n.created_at AS date
    FROM news n
    JOIN users u ON n.author_id = u.id
    ${where}
    ORDER BY n.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, (page - 1) * limit);

  return { items: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export function getNewsById(id) {
  const db = getDb();
  return db.prepare(`
    SELECT n.id, n.title, n.summary, n.content, n.category, n.image_url AS imageUrl,
           u.username AS author, n.author_id AS authorId, n.created_at AS date
    FROM news n
    JOIN users u ON n.author_id = u.id
    WHERE n.id = ?
  `).get(id);
}

export function getFeaturedNews() {
  const db = getDb();
  return db.prepare(`
    SELECT n.id, n.title, n.summary, n.category, n.image_url AS imageUrl,
           u.username AS author, n.created_at AS date
    FROM news n
    JOIN users u ON n.author_id = u.id
    ORDER BY n.created_at DESC
    LIMIT 1
  `).get();
}
