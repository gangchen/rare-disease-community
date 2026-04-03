import Navbar from '@/components/Navbar';
import { Users, BookOpen, Shield, Lightbulb, HandHeart, Mail, Globe } from 'lucide-react';

export const metadata = { title: '关于我们 - Rare2AI' };

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-400/20 mb-4">
            <div className="w-6 h-6 rounded-full bg-primary-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">关于 Rare2AI</h1>
          <p className="text-lg text-gray-400 max-w-lg mx-auto leading-relaxed">
            即使是最罕见的疾病，患者也不应该孤独面对
          </p>
        </div>

        {/* Mission */}
        <section className="mb-14">
          <div className="rounded-2xl bg-surface-800 border border-surface-600 p-8 md:p-10">
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary-400" />
              我们的使命
            </h2>
            <p className="text-gray-400 leading-relaxed">
              Rare2AI 致力于为罕见病患者、家属和研究者搭建一个温暖、专业的交流互助平台。
              全球有超过 7,000 种罕见病，影响着约 3 亿人。在中国，罕见病患者超过 2,000 万。
              他们中的很多人，确诊之路漫长而孤独。我们希望通过这个平台，让信息流通、让经验共享、让温暖传递。
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-white mb-6">我们提供什么</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl border border-surface-600 bg-surface-800 hover:border-primary-400/30 transition-colors">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary-400/20 mb-4">
                <Users className="w-5 h-5 text-primary-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">病种社区</h3>
              <p className="text-sm text-gray-400 leading-relaxed">按病种分类的讨论区，让同类疾病的患者和家属能够快速找到彼此。</p>
            </div>
            <div className="p-6 rounded-2xl border border-surface-600 bg-surface-800 hover:border-primary-400/30 transition-colors">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-sky-400/20 mb-4">
                <BookOpen className="w-5 h-5 text-sky-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">经验分享</h3>
              <p className="text-sm text-gray-400 leading-relaxed">治疗经历、用药心得、康复指南等宝贵经验的分享和交流。</p>
            </div>
            <div className="p-6 rounded-2xl border border-surface-600 bg-surface-800 hover:border-primary-400/30 transition-colors">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-rare-400/20 mb-4">
                <Lightbulb className="w-5 h-5 text-rare-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">政策资讯</h3>
              <p className="text-sm text-gray-400 leading-relaxed">最新的罕见病相关政策、医保报销、药物审批等信息汇总。</p>
            </div>
            <div className="p-6 rounded-2xl border border-surface-600 bg-surface-800 hover:border-primary-400/30 transition-colors">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-rose-400/20 mb-4">
                <HandHeart className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">互助支持</h3>
              <p className="text-sm text-gray-400 leading-relaxed">患者之间的心理支持和生活互助，让每个人都能感受到社区的温暖。</p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4">联系我们</h2>
          <p className="text-gray-400 mb-4">如果您有任何建议或合作意向，请通过以下方式联系：</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-surface-800 border border-surface-600 text-sm text-gray-300">
              <Mail className="w-4 h-4 text-gray-500" />
              contact@rare-disease-community.org
            </div>
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-surface-800 border border-surface-600 text-sm text-gray-300">
              <Globe className="w-4 h-4 text-gray-500" />
              gangchen/rare-disease-community
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
