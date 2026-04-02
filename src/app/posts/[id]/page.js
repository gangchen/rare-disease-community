'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { ArrowLeft, MessageCircle, Eye, Calendar, User, Send, Heart, Pencil, Trash2, X, Check } from 'lucide-react';
import { timeAgo } from '@/lib/timeAgo';
import RoleBadge from '@/components/RoleBadge';
import SafeContent from '@/components/SafeContent';

export default function PostDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', content: '' });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setCurrentUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    fetch(`/api/posts/${id}`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => {
        setPost(data);
        setLikeCount(data.likes || 0);
        setEditForm({ title: data.title, content: data.content });
      })
      .catch(() => setPost(null))
      .finally(() => setLoading(false));

    fetch(`/api/posts/${id}/like`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          setLiked(data.liked);
          setLikeCount(data.count);
        }
      });
  }, [id]);

  const canEdit = currentUser && post && (currentUser.id === post.authorId || currentUser.role === 'admin');

  async function handleLike() {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    const res = await fetch(`/api/posts/${id}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setLiked(data.liked);
      setLikeCount(data.count);
    }
  }

  async function handleSaveEdit() {
    const token = localStorage.getItem('token');
    if (!token) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setPost(updated);
        setEditing(false);
      } else {
        setError((await res.json()).error || '编辑失败');
      }
    } catch {
      setError('网络错误');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    const token = localStorage.getItem('token');
    if (!token) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        router.push('/posts');
      } else {
        setError((await res.json()).error || '删除失败');
        setDeleting(false);
      }
    } catch {
      setError('网络错误');
      setDeleting(false);
    }
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!comment.trim()) return;
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/posts/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: comment }),
      });
      if (res.status === 401) { router.push('/login'); return; }
      if (!res.ok) { setError((await res.json()).error); return; }
      const newComment = await res.json();
      setPost({ ...post, comments: [...post.comments, newComment], replies: post.replies + 1 });
      setComment('');
    } catch {
      setError('网络错误');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-surface-700 rounded w-3/4" />
            <div className="h-4 bg-surface-700 rounded w-1/2" />
            <div className="h-40 bg-surface-700 rounded" />
          </div>
        </main>
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-white mb-3">帖子不存在</h1>
          <p className="text-gray-500 mb-6">可能已被删除或链接有误</p>
          <Link href="/posts" className="text-primary-400 hover:underline font-medium">返回讨论列表</Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <Link href="/posts" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-400 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> 返回讨论列表
        </Link>

        {/* Post */}
        <article className="bg-surface-800 rounded-2xl border border-surface-600 p-6 md:p-8 mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-2.5 py-1 rounded-lg bg-primary-400/10 text-primary-400 text-xs font-medium">
              {post.disease}
            </span>
            {canEdit && !editing && (
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-gray-400 hover:text-primary-400 bg-surface-700 rounded-lg transition"
                >
                  <Pencil className="w-3.5 h-3.5" /> 编辑
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-gray-400 hover:text-red-400 bg-surface-700 rounded-lg transition disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" /> {deleting ? '删除中...' : '删除'}
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-surface-700 border border-surface-600 text-white focus:border-primary-400 outline-none transition text-lg font-bold"
              />
              <textarea
                value={editForm.content}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                rows={10}
                className="w-full px-4 py-3 rounded-xl bg-surface-700 border border-surface-600 text-white focus:border-primary-400 outline-none transition resize-y"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-400 text-black rounded-xl text-sm font-medium hover:bg-primary-300 transition disabled:opacity-50"
                >
                  <Check className="w-4 h-4" /> {submitting ? '保存中...' : '保存'}
                </button>
                <button
                  onClick={() => { setEditing(false); setEditForm({ title: post.title, content: post.content }); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-surface-700 text-gray-400 rounded-xl text-sm font-medium hover:text-white transition"
                >
                  <X className="w-4 h-4" /> 取消
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-4">{post.title}</h1>

              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-500">
                <span className="flex items-center gap-1"><User className="w-4 h-4" /> {post.author} <RoleBadge role={post.authorRole} /></span>
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {timeAgo(post.date)}</span>
                <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {post.views}</span>
                <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> {post.replies}</span>
              </div>

              <SafeContent text={post.content} className="text-gray-300 leading-relaxed mb-6" />

              {/* Like button */}
              <button
                onClick={handleLike}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  liked ? 'bg-primary-400/10 text-primary-400' : 'bg-surface-700 text-gray-400 hover:text-primary-400'
                }`}
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-primary-400' : ''}`} />
                {likeCount}
              </button>
            </>
          )}
        </article>

        {/* Comments */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary-400" />
            评论 ({post.comments.length})
          </h2>

          {post.comments.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">暂无评论，来说第一句话吧</div>
          ) : (
            <div className="space-y-3 mb-8">
              {post.comments.map((c) => (
                <div key={c.id} className="bg-surface-800 rounded-xl border border-surface-600 p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary-400/20 flex items-center justify-center text-primary-400 text-sm font-bold">
                      {c.author[0]}
                    </div>
                    <span className="font-medium text-gray-300 text-sm">{c.author}</span>
                    <RoleBadge role={c.authorRole} />
                    <span className="text-xs text-gray-500">{timeAgo(c.date)}</span>
                  </div>
                  <SafeContent text={c.content} className="text-gray-400 text-sm leading-relaxed pl-11" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>
          )}
          <form onSubmit={handleComment} className="flex gap-3">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="写下你的评论..."
              className="flex-1 px-4 py-3 rounded-xl bg-surface-700 border border-surface-600 text-white placeholder-gray-500 focus:border-primary-400 focus:ring-1 focus:ring-primary-400/20 outline-none transition text-sm"
            />
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="inline-flex items-center gap-2 px-5 py-3 bg-primary-400 text-black rounded-xl font-medium hover:bg-primary-300 transition disabled:opacity-50 shrink-0"
            >
              <Send className="w-4 h-4" />
              {submitting ? '...' : '发送'}
            </button>
          </form>
        </section>
      </main>
    </>
  );
}
