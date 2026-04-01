import { NextResponse } from 'next/server';
import { getAllDiseases, getCategories } from '@/data/diseases';
import { getAllPosts } from '@/data/posts';
import { getAllUsers } from '@/data/users';

// GET /api/stats
// 返回社区整体统计数据
export async function GET() {
  const diseases = getAllDiseases();
  const posts = getAllPosts({ limit: 999 });
  const users = getAllUsers({ limit: 999 });
  const categories = getCategories();

  const totalMembers = diseases.reduce((sum, d) => sum + d.members, 0);
  const totalPostViews = posts.items.reduce((sum, p) => sum + p.views, 0);

  return NextResponse.json({
    users: users.total,
    diseases: diseases.length,
    categories: categories.length,
    posts: posts.total,
    totalMembers,
    totalPostViews,
    topDiseases: diseases
      .sort((a, b) => b.members - a.members)
      .slice(0, 5)
      .map(({ id, name, members, posts }) => ({ id, name, members, posts })),
    recentActivity: {
      postsThisWeek: posts.items.filter((p) => p.date >= '2026-03-25').length,
    },
  });
}
