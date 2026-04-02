'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { timeAgo } from '@/lib/timeAgo';
import { ChevronDown } from 'lucide-react';

const CATEGORIES = [
  { key: '', label: '全部' },
  { key: 'research', label: '研究' },
  { key: 'policy', label: '政策' },
  { key: 'patient_story', label: '患者故事' },
  { key: 'drug_approval', label: '药物审批' },
];

const CATEGORY_LABELS = {
  research: '研究',
  policy: '政策',
  patient_story: '患者故事',
  drug_approval: '药物审批',
};

const GRADIENT_COLORS = [
  'from-primary-400/20 to-amber-700/10',
  'from-sky-400/20 to-blue-700/10',
  'from-rare-400/20 to-purple-700/10',
  'from-rose-400/20 to-red-700/10',
  'from-emerald-400/20 to-teal-700/10',
];

const PAGE_SIZE = 12;

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchNews = useCallback((pageNum, cat, append = false) => {
    if (append) setLoadingMore(true); else setLoading(true);
    const params = new URLSearchParams({ page: pageNum, limit: PAGE_SIZE });
    if (cat) params.set('category', cat);
    fetch(`/api/news?${params}`)
      .then((r) => r.json())
      .then((data) => {
        const items = data.items || [];
        if (append) {
          setNews(prev => [...prev, ...items]);
        } else {
          if (!cat && items.length > 0) {
            setFeatured(items[0]);
            setNews(items.slice(1));
          } else {
            setFeatured(null);
            setNews(items);
          }
        }
        setPage(pageNum);
        setHasMore(pageNum < data.totalPages);
      })
      .finally(() => { setLoading(false); setLoadingMore(false); });
  }, []);

  useEffect(() => {
    fetchNews(1, category);
  }, [category, fetchNews]);

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="text-center py-16 px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-3">最新动态</h1>
          <p className="text-gray-400">Research, policy updates and patient stories.</p>

          {/* Category Tabs */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  category === cat.key
                    ? 'bg-primary-400 text-black'
                    : 'bg-surface-800 text-gray-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 pb-20">
          {loading ? (
            <div className="space-y-6">
              <div className="h-64 bg-surface-800 border border-surface-600 rounded-2xl animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 bg-surface-800 border border-surface-600 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Featured Article */}
              {featured && (
                <Link href={`/news/${featured.id}`} className="block mb-8 group">
                  <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${GRADIENT_COLORS[0]} p-8 md:p-12 min-h-[280px] flex flex-col justify-end border border-surface-600`}>
                    <span className="absolute top-6 left-6 px-3 py-1 bg-primary-400 text-black text-xs font-semibold rounded-md">
                      {CATEGORY_LABELS[featured.category] || featured.category}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-bold text-white group-hover:text-primary-400 transition-colors mb-2">{featured.title}</h2>
                    <p className="text-gray-400 text-sm">{featured.summary}</p>
                  </div>
                </Link>
              )}

              {/* News Grid */}
              {news.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {news.map((item, idx) => (
                      <Link
                        key={item.id}
                        href={`/news/${item.id}`}
                        className="bg-surface-800 border border-surface-600 rounded-xl overflow-hidden group hover:border-primary-400/50 transition-all"
                      >
                        <div className={`h-40 bg-gradient-to-br ${GRADIENT_COLORS[(idx + 1) % GRADIENT_COLORS.length]}`} />
                        <div className="p-5">
                          <span className="inline-block px-2 py-0.5 bg-primary-400/10 text-primary-400 text-xs font-medium rounded mb-3">
                            {CATEGORY_LABELS[item.category] || item.category}
                          </span>
                          <h3 className="text-white font-semibold mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">{item.title}</h3>
                          <p className="text-gray-500 text-sm line-clamp-2 mb-3">{item.summary}</p>
                          <p className="text-xs text-gray-600">{timeAgo(item.date)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Load More */}
                  {hasMore && (
                    <div className="text-center mt-8">
                      <button
                        onClick={() => fetchNews(page + 1, category, true)}
                        disabled={loadingMore}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-surface-800 border border-surface-600 text-gray-400 rounded-xl text-sm font-medium hover:text-white hover:border-primary-400/50 transition disabled:opacity-50"
                      >
                        <ChevronDown className="w-4 h-4" />
                        {loadingMore ? '加载中...' : '加载更多'}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20 text-gray-500">暂无新闻</div>
              )}
            </>
          )}
        </section>
      </main>
    </>
  );
}
