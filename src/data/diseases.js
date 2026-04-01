import { getDb } from '@/lib/db';

export function getAllDiseases() {
  const db = getDb();
  return db.prepare('SELECT id, name, category, members, posts_count AS posts, description FROM diseases ORDER BY id').all();
}

export function getDiseaseById(id) {
  const db = getDb();
  return db.prepare('SELECT id, name, category, members, posts_count AS posts, description FROM diseases WHERE id = ?').get(id) || null;
}

export function getDiseasesByCategory(category) {
  const db = getDb();
  return db.prepare('SELECT id, name, category, members, posts_count AS posts, description FROM diseases WHERE category = ?').all(category);
}

export function searchDiseases(query) {
  const db = getDb();
  const pattern = `%${query}%`;
  return db.prepare(
    'SELECT id, name, category, members, posts_count AS posts, description FROM diseases WHERE name LIKE ? OR description LIKE ?'
  ).all(pattern, pattern);
}

export function getCategories() {
  const db = getDb();
  return db.prepare(
    'SELECT category AS name, COUNT(*) AS count FROM diseases GROUP BY category'
  ).all();
}
