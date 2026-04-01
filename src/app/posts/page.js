import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { MessageCircle, Eye, PenLine, TrendingUp } from 'lucide-react';

const POSTS = [
  { id: 1, title: '确诊SMA后的治疗经历分享', author: '希望之光', disease: '脊髓性肌萎缩症', date: '2026-03-30', replies: 23, views: 456 },
  { id: 2, title: '渐冻症患者家属互助指南', author: '守护者', disease: '渐冻症', date: '2026-03-29', replies: 45, views: 892 },
  { id: 3, title: 'PKU饮食管理经验总结', author: '营养师小王', disease: '苯丙酮尿症', date: '2026-03-28', replies: 18, views: 324 },
  { id: 4, title: '戈谢病最新药物临床试验信息', author: '医学前沿', disease: '戈谢病', date: '2026-03-27', replies: 31, views: 567 },
  { id: 5, title: '血友病患者运动注意事项', author: '运动达人', disease: '血友病', date: '2026-03-26', replies: 15, views: 278 },
  { id: 6, title: '罕见病用药报销政策解读', author: '政策观察', disease: '综合', date: '2026-03-25', replies: 67, views: 1230 },
  { id: 7, title: '瓷娃娃康复训练分享', author: '坚强妈妈', disease: '成骨不全症', date: '2026-03-24', replies: 28, views: 445 },
  { id: 8, title: '如何面对确诊后的心理压力', author: '心理咨询师', disease: '综合', date: '2026-03-23', replies: 52, views: 980 },
];

export const metadata = { title: '社区讨论 - 罕见病社区' };

export default function PostsPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">社区讨论</h1>
            <p className="text-gray-500">分享经验，互相帮助，你的每一句话都可能温暖他人</p>
          </div>
          <Link
            href="/posts/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium shadow-sm shadow-primary-200 hover:bg-primary-700 transition shrink-0"
          >
            <PenLine className="w-4 h-4" /> 发布新帖
          </Link>
        </div>

        {/* Hot tip */}
        <div className="flex items-center gap-2 px-4 py-3 mb-6 rounded-xl bg-warm-50 border border-warm-200 text-sm text-warm-500">
          <TrendingUp className="w-4 h-4 shrink-0" />
          <span>本周最热：<strong className="text-gray-700">罕见病用药报销政策解读</strong> — 67 条回复</span>
        </div>

        <div className="space-y-3">
          {POSTS.map((post, i) => (
            <Link
              href={`/posts/${post.id}`}
              key={post.id}
              className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all"
            >
              {/* Rank number for top 3 */}
              <div className={`hidden sm:flex w-8 h-8 rounded-lg items-center justify-center text-sm font-bold shrink-0 ${
                i < 3 ? 'bg-primary-50 text-primary-600' : 'bg-gray-50 text-gray-400'
              }`}>
                {i + 1}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors truncate">
                  {post.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-400">
                  <span>{post.author}</span>
                  <span className="px-2 py-0.5 rounded-md bg-primary-50 text-primary-600 text-xs font-medium">
                    {post.disease}
                  </span>
                  <span>{post.date}</span>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-4 text-sm text-gray-400 shrink-0">
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" /> {post.replies}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" /> {post.views}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
