import Link from 'next/link';
import Navbar from '@/components/Navbar';
import styles from './page.module.css';

const FEATURED_DISEASES = [
  { id: 1, name: '渐冻症 (ALS)', count: 128, color: '#818cf8' },
  { id: 2, name: '脊髓性肌萎缩症 (SMA)', count: 96, color: '#34d399' },
  { id: 3, name: '戈谢病', count: 64, color: '#fbbf24' },
  { id: 4, name: '苯丙酮尿症 (PKU)', count: 85, color: '#f87171' },
  { id: 5, name: '血友病', count: 112, color: '#60a5fa' },
  { id: 6, name: '白化病', count: 43, color: '#a78bfa' },
];

const RECENT_POSTS = [
  { id: 1, title: '确诊SMA后的治疗经历分享', author: '希望之光', disease: '脊髓性肌萎缩症', date: '2026-03-30', replies: 23 },
  { id: 2, title: '渐冻症患者家属互助指南', author: '守护者', disease: '渐冻症', date: '2026-03-29', replies: 45 },
  { id: 3, title: 'PKU饮食管理经验总结', author: '营养师小王', disease: '苯丙酮尿症', date: '2026-03-28', replies: 18 },
  { id: 4, title: '戈谢病最新药物临床试验信息', author: '医学前沿', disease: '戈谢病', date: '2026-03-27', replies: 31 },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>罕见病社区</h1>
          <p className={styles.heroSubtitle}>
            连接患者、家属与研究者，让每一种罕见病都被看见
          </p>
          <div className={styles.heroActions}>
            <Link href="/diseases" className={styles.btnPrimary}>浏览病种</Link>
            <Link href="/posts" className={styles.btnSecondary}>查看讨论</Link>
          </div>
        </section>

        {/* Stats */}
        <section className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>1,200+</span>
            <span className={styles.statLabel}>注册用户</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>50+</span>
            <span className={styles.statLabel}>病种分类</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>3,500+</span>
            <span className={styles.statLabel}>社区帖子</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>200+</span>
            <span className={styles.statLabel}>互助小组</span>
          </div>
        </section>

        {/* Disease Categories */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>热门病种</h2>
            <Link href="/diseases">查看全部 &rarr;</Link>
          </div>
          <div className={styles.diseaseGrid}>
            {FEATURED_DISEASES.map((disease) => (
              <Link
                href={`/diseases/${disease.id}`}
                key={disease.id}
                className={styles.diseaseCard}
              >
                <div
                  className={styles.diseaseIcon}
                  style={{ backgroundColor: disease.color }}
                />
                <h3>{disease.name}</h3>
                <p>{disease.count} 位成员</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Posts */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>最新讨论</h2>
            <Link href="/posts">查看全部 &rarr;</Link>
          </div>
          <div className={styles.postList}>
            {RECENT_POSTS.map((post) => (
              <Link
                href={`/posts/${post.id}`}
                key={post.id}
                className={styles.postCard}
              >
                <div className={styles.postInfo}>
                  <h3>{post.title}</h3>
                  <div className={styles.postMeta}>
                    <span>{post.author}</span>
                    <span className={styles.postTag}>{post.disease}</span>
                    <span>{post.date}</span>
                  </div>
                </div>
                <div className={styles.postReplies}>
                  {post.replies} 回复
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <p>&copy; 2026 罕见病社区 Rare Disease Community</p>
          <p>让每一个生命都有被关注的权利</p>
        </footer>
      </main>
    </>
  );
}
