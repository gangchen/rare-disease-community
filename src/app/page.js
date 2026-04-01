import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Users, BookOpen, MessageCircle, HandHeart, ArrowRight, Sparkles, Brain, Droplets, Bone, Activity } from 'lucide-react';

const CATEGORY_ICONS = {
  '神经系统疾病': Brain,
  '代谢性疾病': Activity,
  '血液系统疾病': Droplets,
  '其他': Bone,
};

const CATEGORY_COLORS = {
  '神经系统疾病': { bg: 'bg-rare-50', icon: 'text-rare-500', border: 'border-rare-200' },
  '代谢性疾病': { bg: 'bg-warm-50', icon: 'text-warm-500', border: 'border-warm-200' },
  '血液系统疾病': { bg: 'bg-rose-50', icon: 'text-rose-500', border: 'border-rose-100' },
  '其他': { bg: 'bg-sky-50', icon: 'text-sky-500', border: 'border-sky-100' },
};

const FEATURED_DISEASES = [
  { id: 1, name: '渐冻症 (ALS)', count: 128, category: '神经系统疾病' },
  { id: 2, name: '脊髓性肌萎缩症 (SMA)', count: 96, category: '神经系统疾病' },
  { id: 3, name: '戈谢病', count: 64, category: '代谢性疾病' },
  { id: 4, name: '苯丙酮尿症 (PKU)', count: 85, category: '代谢性疾病' },
  { id: 5, name: '血友病', count: 112, category: '血液系统疾病' },
  { id: 6, name: '白化病', count: 43, category: '其他' },
];

const RECENT_POSTS = [
  { id: 1, title: '确诊SMA后的治疗经历分享', author: '希望之光', disease: '脊髓性肌萎缩症', date: '2026-03-30', replies: 23 },
  { id: 2, title: '渐冻症患者家属互助指南', author: '守护者', disease: '渐冻症', date: '2026-03-29', replies: 45 },
  { id: 3, title: 'PKU饮食管理经验总结', author: '营养师小王', disease: '苯丙酮尿症', date: '2026-03-28', replies: 18 },
  { id: 4, title: '戈谢病最新药物临床试验信息', author: '医学前沿', disease: '戈谢病', date: '2026-03-27', replies: 31 },
];

const STATS = [
  { icon: Users, value: '1,200+', label: '注册用户', color: 'text-primary-600' },
  { icon: Sparkles, value: '50+', label: '病种分类', color: 'text-rare-500' },
  { icon: BookOpen, value: '3,500+', label: '社区帖子', color: 'text-warm-500' },
  { icon: HandHeart, value: '200+', label: '互助小组', color: 'text-rose-500' },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-rare-50" />
          <div className="absolute top-20 left-10 w-64 h-64 bg-primary-200/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-rare-200/20 rounded-full blur-3xl" />

          <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-primary-100/60 text-primary-700 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              让每一种罕见都被看见
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              罕见病<span className="text-primary-600">社区</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8 leading-relaxed">
              连接患者、家属与研究者，在这里分享经验、获取信息、互相温暖。
              你不是一个人在战斗。
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/diseases"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium shadow-lg shadow-primary-200 hover:bg-primary-700 transition"
              >
                浏览病种 <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/posts"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-700 rounded-xl font-medium border border-primary-200 hover:bg-primary-50 transition"
              >
                <MessageCircle className="w-4 h-4" /> 查看讨论
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="max-w-6xl mx-auto px-4 -mt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
                <s.icon className={`w-6 h-6 mx-auto mb-2 ${s.color}`} />
                <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Disease Categories */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">热门病种</h2>
              <p className="text-gray-500 mt-1">找到你关注的病种社区</p>
            </div>
            <Link href="/diseases" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
              查看全部 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURED_DISEASES.map((d) => {
              const colors = CATEGORY_COLORS[d.category] || CATEGORY_COLORS['其他'];
              const Icon = CATEGORY_ICONS[d.category] || Bone;
              return (
                <Link
                  href={`/diseases/${d.id}`}
                  key={d.id}
                  className={`group flex items-center gap-4 p-5 rounded-2xl border ${colors.border} ${colors.bg} hover:shadow-md transition-all`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white shadow-sm`}>
                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors truncate">
                      {d.name}
                    </h3>
                    <p className="text-sm text-gray-500">{d.count} 位成员</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary-400 transition-colors" />
                </Link>
              );
            })}
          </div>
        </section>

        {/* Recent Posts */}
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">最新讨论</h2>
              <p className="text-gray-500 mt-1">来自社区的真实声音</p>
            </div>
            <Link href="/posts" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
              查看全部 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {RECENT_POSTS.map((post) => (
              <Link
                href={`/posts/${post.id}`}
                key={post.id}
                className="group flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all"
              >
                <div className="min-w-0 flex-1">
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
                <div className="hidden sm:flex items-center gap-1 text-sm text-gray-400 ml-4">
                  <MessageCircle className="w-4 h-4" />
                  {post.replies}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-6xl mx-auto px-4 pb-20">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 to-primary-700 p-10 md:p-14 text-center text-white">
            <div className="absolute top-0 right-0 w-60 h-60 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">加入我们，温暖彼此</h2>
              <p className="text-primary-100 max-w-md mx-auto mb-6">
                无论你是患者、家属还是研究者，这里都有属于你的位置
              </p>
              <Link
                href="/posts"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-700 rounded-xl font-medium hover:bg-primary-50 transition"
              >
                <HandHeart className="w-5 h-5" /> 开始交流
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-100 bg-white/50">
          <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-gray-400">
            <p>&copy; 2026 罕见病社区 Rare Disease Community</p>
            <p className="mt-1">让每一个生命都有被关注的权利</p>
          </div>
        </footer>
      </main>
    </>
  );
}
