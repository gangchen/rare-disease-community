import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Brain, Activity, Droplets, Bone, Users, BookOpen, ArrowRight } from 'lucide-react';

const CATEGORY_META = {
  '神经系统疾病': { icon: Brain, color: 'text-rare-500', bg: 'bg-rare-50', border: 'border-rare-200', badge: 'bg-rare-100 text-rare-600' },
  '代谢性疾病': { icon: Activity, color: 'text-warm-500', bg: 'bg-warm-50', border: 'border-warm-200', badge: 'bg-warm-100 text-warm-500' },
  '血液系统疾病': { icon: Droplets, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100', badge: 'bg-rose-100 text-rose-500' },
  '其他': { icon: Bone, color: 'text-sky-500', bg: 'bg-sky-50', border: 'border-sky-100', badge: 'bg-sky-100 text-sky-500' },
};

const DISEASE_CATEGORIES = [
  {
    category: '神经系统疾病',
    diseases: [
      { id: 1, name: '渐冻症 (ALS)', members: 128, posts: 342 },
      { id: 2, name: '脊髓性肌萎缩症 (SMA)', members: 96, posts: 218 },
      { id: 7, name: '亨廷顿舞蹈症', members: 54, posts: 127 },
      { id: 8, name: '多发性硬化症', members: 87, posts: 265 },
    ],
  },
  {
    category: '代谢性疾病',
    diseases: [
      { id: 3, name: '戈谢病', members: 64, posts: 156 },
      { id: 4, name: '苯丙酮尿症 (PKU)', members: 85, posts: 198 },
      { id: 9, name: '法布里病', members: 38, posts: 89 },
      { id: 10, name: '庞贝病', members: 42, posts: 103 },
    ],
  },
  {
    category: '血液系统疾病',
    diseases: [
      { id: 5, name: '血友病', members: 112, posts: 287 },
      { id: 11, name: '地中海贫血', members: 156, posts: 412 },
      { id: 12, name: '阵发性睡眠性血红蛋白尿', members: 29, posts: 67 },
    ],
  },
  {
    category: '其他',
    diseases: [
      { id: 6, name: '白化病', members: 43, posts: 98 },
      { id: 13, name: '成骨不全症 (瓷娃娃)', members: 76, posts: 189 },
      { id: 14, name: '马凡综合征', members: 61, posts: 134 },
    ],
  },
];

export const metadata = { title: '病种分类 - 罕见病社区' };

export default function DiseasesPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">病种分类</h1>
        <p className="text-gray-500 mb-10">选择你关注的病种，加入对应的讨论社区</p>

        <div className="space-y-10">
          {DISEASE_CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat.category] || CATEGORY_META['其他'];
            const Icon = meta.icon;
            return (
              <section key={cat.category}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${meta.bg}`}>
                    <Icon className={`w-5 h-5 ${meta.color}`} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{cat.category}</h2>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${meta.badge}`}>
                    {cat.diseases.length} 种
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {cat.diseases.map((d) => (
                    <Link
                      href={`/diseases/${d.id}`}
                      key={d.id}
                      className={`group p-5 rounded-2xl border ${meta.border} ${meta.bg} hover:shadow-md transition-all`}
                    >
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors mb-3 truncate">
                        {d.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" /> {d.members}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" /> {d.posts}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </>
  );
}
