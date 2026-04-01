import { getDb } from '@/lib/db';

function enrichPost(row) {
  if (!row) return null;
  const db = getDb();
  const comments = db.prepare(`
    SELECT c.id, u.username AS author, c.author_id AS authorId, c.content, c.created_at AS date
    FROM comments c JOIN users u ON c.author_id = u.id
    WHERE c.post_id = ? ORDER BY c.created_at
  `).all(row.id);

  return {
    ...row,
    comments,
    replies: comments.length,
  };
}

export function getAllPosts({ page = 1, limit = 10, diseaseId, sort = 'date' } = {}) {
  const db = getDb();

  let where = '';
  const params = [];
  if (diseaseId) {
    where = 'WHERE p.disease_id = ?';
    params.push(diseaseId);
  }

  const orderMap = {
    date: 'p.created_at DESC',
    views: 'p.views DESC',
    replies: 'reply_count DESC',
  };
  const order = orderMap[sort] || orderMap.date;

  const countRow = db.prepare(`SELECT COUNT(*) AS total FROM posts p ${where}`).get(...params);
  const total = countRow.total;

  const rows = db.prepare(`
    SELECT p.id, p.title, p.content, u.username AS author, p.author_id AS authorId,
           p.disease_id AS diseaseId, COALESCE(d.name, '综合') AS disease,
           p.created_at AS date, p.views,
           (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS reply_count
    FROM posts p
    JOIN users u ON p.author_id = u.id
    LEFT JOIN diseases d ON p.disease_id = d.id
    ${where}
    ORDER BY ${order}
    LIMIT ? OFFSET ?
  `).all(...params, limit, (page - 1) * limit);

  const items = rows.map((row) => {
    const { reply_count, ...rest } = row;
    return { ...rest, replies: reply_count, comments: [] };
  });

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export function getPostById(id) {
  const db = getDb();
  const row = db.prepare(`
    SELECT p.id, p.title, p.content, u.username AS author, p.author_id AS authorId,
           p.disease_id AS diseaseId, COALESCE(d.name, '综合') AS disease,
           p.created_at AS date, p.views
    FROM posts p
    JOIN users u ON p.author_id = u.id
    LEFT JOIN diseases d ON p.disease_id = d.id
    WHERE p.id = ?
  `).get(id);

  return enrichPost(row);
}

export function createPost({ title, content, authorId, diseaseId, disease }) {
  const db = getDb();
  const now = new Date().toISOString().split('T')[0];
  const result = db.prepare(
    'INSERT INTO posts (title, content, author_id, disease_id, created_at, views) VALUES (?, ?, ?, ?, ?, 0)'
  ).run(title, content, authorId, diseaseId || null, now);

  return getPostById(result.lastInsertRowid);
}

export function addComment(postId, { authorId, content }) {
  const db = getDb();

  const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(postId);
  if (!post) return null;

  const now = new Date().toISOString().split('T')[0];
  const result = db.prepare(
    'INSERT INTO comments (post_id, author_id, content, created_at) VALUES (?, ?, ?, ?)'
  ).run(postId, authorId, content, now);

  const comment = db.prepare(`
    SELECT c.id, u.username AS author, c.author_id AS authorId, c.content, c.created_at AS date
    FROM comments c JOIN users u ON c.author_id = u.id
    WHERE c.id = ?
  `).get(result.lastInsertRowid);

  return comment;
}

export function searchPosts(query) {
  const db = getDb();
  const pattern = `%${query}%`;
  const rows = db.prepare(`
    SELECT p.id, p.title, p.content, u.username AS author, p.author_id AS authorId,
           p.disease_id AS diseaseId, COALESCE(d.name, '综合') AS disease,
           p.created_at AS date, p.views,
           (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS replies
    FROM posts p
    JOIN users u ON p.author_id = u.id
    LEFT JOIN diseases d ON p.disease_id = d.id
    WHERE p.title LIKE ? OR p.content LIKE ?
    ORDER BY p.created_at DESC
  `).all(pattern, pattern);
  return rows;
}
