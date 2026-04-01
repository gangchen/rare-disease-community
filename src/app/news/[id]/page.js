'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { ArrowLeft, Calendar, User } from 'lucide-react';

const CATEGORY_LABELS = {
  research: '研究',
  policy: '政策',
  patient_story: '患者故事',
  drug_approval: '药物审批',
};

export default function NewsDetailPage() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/news/${id}`)
      .then((r) => r.ok ? r.json() : null)
      .then(setArticle)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-10 animate-pulse">
          <div className="h-6 bg-surface-700 rounded w-1/4 mb-6" />
          <div className="h-10 bg-surface-700 rounded w-3/4 mb-4" />
          <div className="h-4 bg-surface-700 rounded w-full mb-2" />
          <div className="h-4 bg-surface-700 rounded w-5/6" />
        </main>
      </>
    );
  }

  if (!article) {
    return (
      <>
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-20 text-center">
          <p className="text-gray-500 text-lg mb-4">新闻不存在</p>
          <Link href="/news" className="text-primary-400 hover:underline">返回新闻列表</Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <Link href="/news" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-400 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          返回新闻
        </Link>

        <span className="inline-block px-3 py-1 bg-primary-400/10 text-primary-400 text-xs font-semibold rounded-full mb-4">
          {CATEGORY_LABELS[article.category] || article.category}
        </span>

        <h1 className="text-3xl font-bold text-white mb-4">{article.title}</h1>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-8">
          <span className="flex items-center gap-1"><User className="w-4 h-4" />{article.author}</span>
          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{article.date}</span>
        </div>

        {article.summary && (
          <p className="text-gray-400 text-lg border-l-2 border-primary-400 pl-4 mb-8">{article.summary}</p>
        )}

        <div className="text-gray-300 leading-relaxed whitespace-pre-line">{article.content}</div>
      </main>
    </>
  );
}
