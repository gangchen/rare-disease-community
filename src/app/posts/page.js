import Link from 'next/link';
import Navbar from '@/components/Navbar';
import styles from './posts.module.css';

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

export const metadata = {
  title: '社区讨论 - 罕见病社区',
};

export default function PostsPage() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>社区讨论</h1>
            <p className={styles.subtitle}>分享经验，互相帮助</p>
          </div>
          <Link href="/posts/new" className={styles.newPost}>发布新帖</Link>
        </div>

        <div className={styles.list}>
          {POSTS.map((post) => (
            <Link
              href={`/posts/${post.id}`}
              key={post.id}
              className={styles.postCard}
            >
              <div className={styles.postInfo}>
                <h3>{post.title}</h3>
                <div className={styles.meta}>
                  <span>{post.author}</span>
                  <span className={styles.tag}>{post.disease}</span>
                  <span>{post.date}</span>
                </div>
              </div>
              <div className={styles.postStats}>
                <span>{post.replies} 回复</span>
                <span>{post.views} 浏览</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
