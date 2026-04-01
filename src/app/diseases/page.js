import Link from 'next/link';
import Navbar from '@/components/Navbar';
import styles from './diseases.module.css';

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

export const metadata = {
  title: '病种分类 - 罕见病社区',
};

export default function DiseasesPage() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <h1 className={styles.title}>病种分类</h1>
        <p className={styles.subtitle}>
          选择你关注的病种，加入对应的讨论社区
        </p>

        {DISEASE_CATEGORIES.map((cat) => (
          <section key={cat.category} className={styles.category}>
            <h2 className={styles.categoryTitle}>{cat.category}</h2>
            <div className={styles.grid}>
              {cat.diseases.map((d) => (
                <Link
                  href={`/diseases/${d.id}`}
                  key={d.id}
                  className={styles.card}
                >
                  <h3>{d.name}</h3>
                  <div className={styles.cardMeta}>
                    <span>{d.members} 成员</span>
                    <span>{d.posts} 帖子</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>
    </>
  );
}
