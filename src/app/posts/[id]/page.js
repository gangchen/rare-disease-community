'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { ArrowLeft, MessageCircle, Eye, Calendar, User, Send } from 'lucide-react';

export default function PostDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/posts/${id}`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(setPost)
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleComment(e) {
    e.preventDefault();
    if (!comment.trim()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

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
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-40 bg-gray-200 rounded" />
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
          <h1 className="text-2xl font-bold text-gray-900 mb-3">帖子不存在</h1>
          <p className="text-gray-500 mb-6">可能已被删除或链接有误</p>
          <Link href="/posts" className="text-primary-600 hover:text-primary-700 font-medium">
            返回讨论列表
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <Link href="/posts" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-primary-600 mb-6">
          <ArrowLeft className="w-4 h-4" /> 返回讨论列表
        </Link>

        {/* Post */}
        <article className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-2.5 py-1 rounded-lg bg-primary-50 text-primary-600 text-xs font-medium">
              {post.disease}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>

          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-400">
            <span className="flex items-center gap-1"><User className="w-4 h-4" /> {post.author}</span>
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {post.date}</span>
            <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {post.views} 浏览</span>
            <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> {post.replies} 回复</span>
          </div>

          <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>
        </article>

        {/* Comments */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary-600" />
            评论 ({post.comments.length})
          </h2>

          {post.comments.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              暂无评论，来说第一句话吧
            </div>
          ) : (
            <div className="space-y-3 mb-8">
              {post.comments.map((c) => (
                <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-bold">
                      {c.author[0]}
                    </div>
                    <span className="font-medium text-gray-900 text-sm">{c.author}</span>
                    <span className="text-xs text-gray-400">{c.date}</span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed pl-11">{c.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Comment Form */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>
          )}
          <form onSubmit={handleComment} className="flex gap-3">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="写下你的评论..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition text-sm"
            />
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="inline-flex items-center gap-2 px-5 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition disabled:opacity-50 shrink-0"
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
