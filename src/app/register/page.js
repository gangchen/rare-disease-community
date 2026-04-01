'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', email: '', password: '', bio: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) {
      setError('请填写用户名、邮箱和密码');
      return;
    }
    if (form.password.length < 6) {
      setError('密码至少 6 位');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || '注册失败，请重试'); return; }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/');
    } catch (err) {
      console.error('Register error:', err);
      setError('网络错误，请检查网络连接后重试');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-[80vh] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-400/20 mb-4">
              <div className="w-7 h-7 rounded-full bg-primary-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">注册罕见病联盟</h1>
            <p className="text-gray-500 mt-1 text-sm">让我们一起互助前行</p>
          </div>

          <div className="bg-surface-800 rounded-2xl border border-surface-600 p-6">
            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">用户名</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="给自己取个名字"
                  className="w-full px-4 py-3 rounded-xl bg-surface-700 border border-surface-600 text-white placeholder-gray-500 focus:border-primary-400 focus:ring-1 focus:ring-primary-400/20 outline-none transition text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">邮箱</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl bg-surface-700 border border-surface-600 text-white placeholder-gray-500 focus:border-primary-400 focus:ring-1 focus:ring-primary-400/20 outline-none transition text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">密码</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="至少 6 位"
                  className="w-full px-4 py-3 rounded-xl bg-surface-700 border border-surface-600 text-white placeholder-gray-500 focus:border-primary-400 focus:ring-1 focus:ring-primary-400/20 outline-none transition text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">个人简介（可选）</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="介绍一下自己..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-surface-700 border border-surface-600 text-white placeholder-gray-500 focus:border-primary-400 focus:ring-1 focus:ring-primary-400/20 outline-none transition text-sm resize-y"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-400 text-black rounded-xl font-medium hover:bg-primary-300 transition disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                {loading ? '注册中...' : '注册'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-400 mt-5">
              已有账号？{' '}
              <Link href="/login" className="text-primary-400 hover:text-primary-300 font-medium">立即登录</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
