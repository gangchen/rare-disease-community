'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { User, Mail, FileText, Key, Plus, Trash2, Copy, Check, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [apiKeys, setApiKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [creatingKey, setCreatingKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const stored = localStorage.getItem('user');
    if (!token || !stored) {
      router.push('/login');
      return;
    }

    const u = JSON.parse(stored);
    setUser(u);
    setForm({ username: u.username || '', bio: u.bio || '' });

    // Fetch latest user info
    fetch(`/api/users/${u.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          setUser(data);
          setForm({ username: data.username || '', bio: data.bio || '' });
          localStorage.setItem('user', JSON.stringify(data));
        }
      });

    // Fetch API keys
    fetch('/api/auth/apikeys', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : { items: [] })
      .then((data) => setApiKeys(data.items || []));
  }, [router]);

  async function handleSave() {
    const token = localStorage.getItem('token');
    if (!token || !user) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });

      if (res.status === 401) { router.push('/login'); return; }
      const data = await res.json();
      if (!res.ok) { setError(data.error || '保存失败'); return; }

      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      setEditing(false);
      setSuccess('资料已更新');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('网络错误');
    } finally {
      setSaving(false);
    }
  }

  async function createApiKey() {
    if (!newKeyName.trim()) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    setCreatingKey(true);
    try {
      const res = await fetch('/api/auth/apikeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newKeyName }),
      });

      if (res.status === 401) { router.push('/login'); return; }
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }

      setApiKeys([...apiKeys, data]);
      setNewKeyName('');
      setCopiedKey(data.key);
      setTimeout(() => setCopiedKey(''), 10000);
    } catch {
      setError('创建失败');
    } finally {
      setCreatingKey(false);
    }
  }

  async function deleteApiKey(key) {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await fetch('/api/auth/apikeys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ key }),
      });
      setApiKeys(apiKeys.filter((k) => k.key !== key));
    } catch {
      setError('删除失败');
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(''), 3000);
  }

  function handleLogout() {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-surface-700 rounded w-1/3" />
            <div className="h-32 bg-surface-700 rounded" />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-white mb-8">个人中心</h1>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>
        )}
        {success && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-sm text-green-400">{success}</div>
        )}

        {/* Profile Card */}
        <div className="bg-surface-800 rounded-2xl border border-surface-600 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">基本信息</h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="text-sm font-medium text-primary-400 hover:text-primary-300"
              >
                编辑
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditing(false); setForm({ username: user.username || '', bio: user.bio || '' }); }}
                  className="text-sm font-medium text-gray-400 hover:text-gray-300"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="text-sm font-medium text-primary-400 hover:text-primary-300 disabled:opacity-50"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">用户名</p>
                {editing ? (
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-surface-700 border border-surface-600 text-white placeholder-gray-500 focus:border-primary-400 focus:ring-1 focus:ring-primary-400/20 outline-none transition text-sm"
                  />
                ) : (
                  <p className="text-white text-sm">{user.username}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 mb-1">邮箱</p>
                <p className="text-white text-sm">{user.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">个人简介</p>
                {editing ? (
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-surface-700 border border-surface-600 text-white placeholder-gray-500 focus:border-primary-400 focus:ring-1 focus:ring-primary-400/20 outline-none transition text-sm resize-y"
                  />
                ) : (
                  <p className="text-gray-300 text-sm">{user.bio || '暂无简介'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* API Keys Section */}
        <div className="bg-surface-800 rounded-2xl border border-surface-600 p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Key className="w-5 h-5 text-primary-400" />
            <h2 className="text-lg font-bold text-white">API 密钥</h2>
          </div>

          <p className="text-sm text-gray-400 mb-4">
            创建 API 密钥供 AI Agent 或第三方应用访问社区 API。
          </p>

          {/* Create new key */}
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="密钥名称，如 my-agent"
              className="flex-1 px-3 py-2.5 rounded-xl bg-surface-700 border border-surface-600 text-white placeholder-gray-500 focus:border-primary-400 focus:ring-1 focus:ring-primary-400/20 outline-none transition text-sm"
            />
            <button
              onClick={createApiKey}
              disabled={creatingKey || !newKeyName.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary-400 text-black rounded-xl text-sm font-medium hover:bg-primary-300 transition disabled:opacity-50 shrink-0"
            >
              <Plus className="w-4 h-4" />
              创建
            </button>
          </div>

          {copiedKey && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-sm text-yellow-300">
              请立即复制保存此密钥，关闭后将无法再次查看：
              <code className="block mt-1 text-xs bg-surface-700 p-2 rounded break-all text-yellow-300">{copiedKey}</code>
            </div>
          )}

          {apiKeys.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">暂无 API 密钥</p>
          ) : (
            <div className="space-y-2">
              {apiKeys.map((k) => (
                <div key={k.key} className="flex items-center justify-between px-4 py-3 bg-surface-700 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-white">{k.name}</p>
                    <p className="text-xs text-gray-500">{k.key}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => deleteApiKey(k.key)}
                      className="p-1.5 text-gray-400 hover:text-red-400 transition"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-3 text-red-400 rounded-xl border border-red-500/20 hover:bg-red-500/10 transition text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          退出登录
        </button>
      </main>
    </>
  );
}
