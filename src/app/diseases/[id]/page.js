'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { ArrowLeft, Users, BookOpen, MessageCircle, ArrowRight } from 'lucide-react';

export default function DiseaseDetailPage() {
  const { id } = useParams();
  const [disease, setDisease] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/diseases/${id}`).then((r) => r.ok ? r.json() : null),
      fetch(`/api/posts?diseaseId=${id}&limit=20`).then((r) => r.ok ? r.json() : { items: [] }),
    ])
      .then(([d, p]) => {
        setDisease(d);
        setPosts(p.items || []);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-surface-700 rounded w-1/2" />
            <div className="h-4 bg-surface-700 rounded w-1/3" />
            <div className="h-32 bg-surface-700 rounded" />
          </div>
        </main>
      </>
    );
  }

  if (!disease) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-white mb-3">病种不存在</h1>
          <Link href="/diseases" className="text-primary-400 hover:text-primary-300 font-medium">返回病种列表</Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <Link href="/diseases" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-primary-300 mb-6">
          <ArrowLeft className="w-4 h-4" /> 返回病种列表
        </Link>

        {/* Disease Info Card */}
        <div className="bg-surface-800 rounded-2xl border border-surface-600 p-6 md:p-8 mb-10">
          <span className="inline-block px-3 py-1 rounded-full bg-primary-400/20 text-primary-400 text-xs font-medium mb-3">
            {disease.category}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">{disease.name}</h1>
          <p className="text-gray-300 leading-relaxed mb-5">{disease.description}</p>
          <div className="flex gap-6">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Users className="w-4 h-4 text-primary-400" />
              <span><strong className="text-white">{disease.members}</strong> 位成员</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <BookOpen className="w-4 h-4 text-primary-400" />
              <span><strong className="text-white">{disease.posts}</strong> 篇帖子</span>
            </div>
          </div>
        </div>

        {/* Posts for this disease */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">相关讨论</h2>
          <Link
            href="/posts/new"
            className="text-sm font-medium text-primary-400 hover:text-primary-300 flex items-center gap-1"
          >
            发帖讨论 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16 bg-surface-800 rounded-2xl border border-surface-600">
            <p className="text-gray-400 mb-4">该病种暂无讨论帖子</p>
            <Link
              href="/posts/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-400 text-black rounded-xl text-sm font-medium hover:bg-primary-300 transition"
            >
              发布第一篇帖子
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <Link
                href={`/posts/${post.id}`}
                key={post.id}
                className="group flex items-center justify-between p-5 bg-surface-800 rounded-2xl border border-surface-600 hover:border-primary-400/40 hover:shadow-md transition-all"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors truncate">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                    <span>{post.author}</span>
                    <span>{post.date}</span>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-sm text-gray-400 ml-4">
                  <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> {post.replies}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
