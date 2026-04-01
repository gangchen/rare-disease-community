import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { getDb } from '@/lib/db';

function getStats() {
  try {
    const db = getDb();
    const users = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
    const diseases = db.prepare('SELECT COUNT(*) AS c FROM diseases').get().c;
    const posts = db.prepare('SELECT COUNT(*) AS c FROM posts').get().c;
    return { users, diseases, posts };
  } catch {
    return { users: 1200, diseases: 50, posts: 3500 };
  }
}

export default function HomePage() {
  const stats = getStats();

  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden">
        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex flex-col items-center justify-center px-4 py-20">
          {/* Decorative blobs */}
          <div className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full bg-gradient-to-br from-primary-400/25 to-orange-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/3 left-1/4 w-56 h-56 rounded-full bg-gradient-to-tr from-sky-400/15 to-blue-500/5 blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 left-1/3 w-40 h-40 rounded-full bg-gradient-to-br from-emerald-400/10 to-teal-500/5 blur-3xl pointer-events-none" />

          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <p className="text-primary-400 text-sm font-medium tracking-wider mb-4">罕见病患者互助平台</p>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">你不是一个人</h1>
            <p className="text-gray-400 text-lg mb-10">Find your companion, share experience, support each other.</p>

            <div className="flex items-center justify-center gap-4">
              <Link
                href="/posts"
                className="px-8 py-3 bg-primary-400 text-black rounded-full text-sm font-semibold hover:bg-primary-300 transition-colors"
              >
                进入社区
              </Link>
              <Link
                href="/news"
                className="px-8 py-3 border border-surface-500 text-white rounded-full text-sm font-semibold hover:bg-surface-700 transition-colors"
              >
                浏览新闻
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative z-10 max-w-4xl mx-auto px-4 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-800 border border-surface-600 rounded-2xl p-8 text-center">
              <p className="text-3xl md:text-4xl font-bold text-white mb-2">{stats.users.toLocaleString()}+</p>
              <p className="text-gray-500 text-sm">注册患者</p>
            </div>
            <div className="bg-surface-800 border border-surface-600 rounded-2xl p-8 text-center">
              <p className="text-3xl md:text-4xl font-bold text-primary-400 mb-2">{stats.diseases}</p>
              <p className="text-gray-500 text-sm">收录病种</p>
            </div>
            <div className="bg-surface-800 border border-surface-600 rounded-2xl p-8 text-center">
              <p className="text-3xl md:text-4xl font-bold text-white mb-2">{stats.posts.toLocaleString()}+</p>
              <p className="text-gray-500 text-sm">社区讨论</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-600 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">&copy; 2026 罕见病联盟</p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/diseases" className="hover:text-gray-300 transition-colors">病种分类</Link>
            <Link href="/about" className="hover:text-gray-300 transition-colors">关于我们</Link>
            <Link href="/api-docs" className="hover:text-gray-300 transition-colors">API 文档</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
