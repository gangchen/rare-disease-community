import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// GET /api/stats
// 直接用 SQL 聚合，更高效
export async function GET() {
  const db = getDb();

  const userCount = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  const diseaseCount = db.prepare('SELECT COUNT(*) AS c FROM diseases').get().c;
  const categoryCount = db.prepare('SELECT COUNT(DISTINCT category) AS c FROM diseases').get().c;
  const postCount = db.prepare('SELECT COUNT(*) AS c FROM posts').get().c;
  const totalMembers = db.prepare('SELECT COALESCE(SUM(members), 0) AS c FROM diseases').get().c;
  const totalPostViews = db.prepare('SELECT COALESCE(SUM(views), 0) AS c FROM posts').get().c;

  const topDiseases = db.prepare(
    'SELECT id, name, members, posts_count AS posts FROM diseases ORDER BY members DESC LIMIT 5'
  ).all();

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const postsThisWeek = db.prepare(
    'SELECT COUNT(*) AS c FROM posts WHERE created_at >= ?'
  ).get(oneWeekAgo).c;

  return NextResponse.json({
    users: userCount,
    diseases: diseaseCount,
    categories: categoryCount,
    posts: postCount,
    totalMembers,
    totalPostViews,
    topDiseases,
    recentActivity: { postsThisWeek },
  });
}
