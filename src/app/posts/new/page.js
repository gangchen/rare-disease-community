'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { PenLine, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

export default function NewPostPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', content: '', disease: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const diseases = [
    '渐冻症 (ALS)', '脊髓性肌萎缩症 (SMA)', '戈谢病', '苯丙酮尿症 (PKU)',
    '血友病', '白化病', '亨廷顿舞蹈症', '多发性硬化症', '法布里病', '庞贝病',
    '地中海贫血', '阵发性睡眠性血红蛋白尿', '成骨不全症 (瓷娃娃)', '马凡综合征', '综合',
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setError('请填写标题和内容');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title,
          content: form.content,
          disease: form.disease || '综合',
        }),
      });

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '发帖失败');
        return;
      }

      router.push(`/posts/${data.id}`);
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <Link href="/posts" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-primary-600 mb-6">
          <ArrowLeft className="w-4 h-4" /> 返回讨论列表
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
            <PenLine className="w-5 h-5 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">发布新帖</h1>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">标题</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="输入帖子标题..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">相关病种</label>
            <select
              value={form.disease}
              onChange={(e) => setForm({ ...form, disease: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition text-gray-900 bg-white"
            >
              <option value="">选择病种（可选）</option>
              {diseases.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">内容</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="分享你的经验、问题或想法..."
              rows={10}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition text-gray-900 resize-y"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium shadow-sm hover:bg-primary-700 transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {loading ? '发布中...' : '发布帖子'}
            </button>
            <Link
              href="/posts"
              className="inline-flex items-center px-6 py-3 text-gray-500 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition"
            >
              取消
            </Link>
          </div>
        </form>
      </main>
    </>
  );
}
