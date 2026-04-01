import Navbar from '@/components/Navbar';
import styles from './about.module.css';

export const metadata = {
  title: '关于我们 - 罕见病社区',
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <h1 className={styles.title}>关于罕见病社区</h1>

        <section className={styles.section}>
          <h2>我们的使命</h2>
          <p>
            罕见病社区致力于为罕见病患者、家属和研究者搭建一个温暖、专业的交流互助平台。
            我们相信，即使是最罕见的疾病，患者也不应该孤独面对。
          </p>
        </section>

        <section className={styles.section}>
          <h2>我们提供什么</h2>
          <div className={styles.features}>
            <div className={styles.feature}>
              <h3>病种社区</h3>
              <p>按病种分类的讨论区，让同类疾病的患者和家属能够快速找到彼此。</p>
            </div>
            <div className={styles.feature}>
              <h3>经验分享</h3>
              <p>治疗经历、用药心得、康复指南等宝贵经验的分享和交流。</p>
            </div>
            <div className={styles.feature}>
              <h3>政策资讯</h3>
              <p>最新的罕见病相关政策、医保报销、药物审批等信息汇总。</p>
            </div>
            <div className={styles.feature}>
              <h3>互助支持</h3>
              <p>患者之间的心理支持和生活互助，让每个人都能感受到社区的温暖。</p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>联系我们</h2>
          <p>
            如果您有任何建议或合作意向，请通过以下方式联系我们：
          </p>
          <ul className={styles.contactList}>
            <li>邮箱: contact@rare-disease-community.org</li>
            <li>GitHub: gangchen/rare-disease-community</li>
          </ul>
        </section>
      </main>
    </>
  );
}
