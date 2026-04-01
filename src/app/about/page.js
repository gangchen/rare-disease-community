import Navbar from '@/components/Navbar';
import { Heart, Users, BookOpen, Shield, Lightbulb, HandHeart, Mail, Globe } from 'lucide-react';

export const metadata = { title: '关于我们 - 罕见病社区' };

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 mb-4">
            <Heart className="w-8 h-8 text-primary-600 fill-primary-200" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">关于罕见病社区</h1>
          <p className="text-lg text-gray-500 max-w-lg mx-auto leading-relaxed">
            即使是最罕见的疾病，患者也不应该孤独面对
          </p>
        </div>

        {/* Mission */}
        <section className="mb-14">
          <div className="rounded-2xl bg-gradient-to-br from-primary-50 to-rare-50 border border-primary-100 p-8 md:p-10">
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary-600" />
              我们的使命
            </h2>
            <p className="text-gray-600 leading-relaxed">
              罕见病社区致力于为罕见病患者、家属和研究者搭建一个温暖、专业的交流互助平台。
              全球有超过 7,000 种罕见病，影响着约 3 亿人。在中国，罕见病患者超过 2,000 万。
              他们中的很多人，确诊之路漫长而孤独。我们希望通过这个平台，让信息流通、让经验共享、让温暖传递。
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-gray-900 mb-6">我们提供什么</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl border border-gray-100 bg-white hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary-50 mb-4">
                <Users className="w-5 h-5 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">病种社区</h3>
              <p className="text-sm text-gray-500 leading-relaxed">按病种分类的讨论区，让同类疾病的患者和家属能够快速找到彼此。</p>
            </div>
            <div className="p-6 rounded-2xl border border-gray-100 bg-white hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-warm-50 mb-4">
                <BookOpen className="w-5 h-5 text-warm-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">经验分享</h3>
              <p className="text-sm text-gray-500 leading-relaxed">治疗经历、用药心得、康复指南等宝贵经验的分享和交流。</p>
            </div>
            <div className="p-6 rounded-2xl border border-gray-100 bg-white hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-rare-50 mb-4">
                <Lightbulb className="w-5 h-5 text-rare-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">政策资讯</h3>
              <p className="text-sm text-gray-500 leading-relaxed">最新的罕见病相关政策、医保报销、药物审批等信息汇总。</p>
            </div>
            <div className="p-6 rounded-2xl border border-gray-100 bg-white hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-rose-50 mb-4">
                <HandHeart className="w-5 h-5 text-rose-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">互助支持</h3>
              <p className="text-sm text-gray-500 leading-relaxed">患者之间的心理支持和生活互助，让每个人都能感受到社区的温暖。</p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">联系我们</h2>
          <p className="text-gray-500 mb-4">如果您有任何建议或合作意向，请通过以下方式联系：</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-600">
              <Mail className="w-4 h-4 text-gray-400" />
              contact@rare-disease-community.org
            </div>
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-600">
              <Globe className="w-4 h-4 text-gray-400" />
              gangchen/rare-disease-community
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
