'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Search, Heart, MessageCircle, PenLine, TrendingUp, Users, ChevronDown, ArrowUpDown, Filter } from 'lucide-react';
import { timeAgo } from '@/lib/timeAgo';

const TABS = [
  { key: '', label: '全部' },
  { key: 'topic', label: '话题' },
  { key: 'experience', label: '经验' },
  { key: 'question', label: '问答' },
];

const SORT_OPTIONS = [
  { key: 'date', label: '最新发布' },
  { key: 'views', label: '最多浏览' },
  { key: 'replies', label: '最多回复' },
];

const PAGE_SIZE = 12;

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('');
  const [sort, setSort] = useState('date');
  const [diseaseId, setDiseaseId] = useState('');
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [topPosts, setTopPosts] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);

  const fetchPosts = useCallback((pageNum, category, append = false, sortVal = 'date', diseaseIdVal = '') => {
    if (append) setLoadingMore(true); else setLoading(true);
    const params = new URLSearchParams({ page: pageNum, limit: PAGE_SIZE });
    if (category) params.set('category', category);
    if (sortVal && sortVal !== 'date') params.set('sort', sortVal);
    if (diseaseIdVal) params.set('diseaseId', diseaseIdVal);
    fetch(`/api/posts?${params}`)
      .then((r) => r.json())
      .then((data) => {
        const items = data.items || [];
        if (append) {
          setPosts(prev => [...prev, ...items]);
        } else {
          setPosts(items);
          const sorted = [...items].sort((a, b) => b.views - a.views);
          setTopPosts(sorted.slice(0, 5));
        }
        setPage(pageNum);
        setHasMore(pageNum < data.totalPages);
      })
      .finally(() => { setLoading(false); setLoadingMore(false); });
  }, []);

  useEffect(() => {
    fetchPosts(1, activeTab, false, sort, diseaseId);
  }, [activeTab, sort, diseaseId, fetchPosts]);

  useEffect(() => {
    fetch('/api/diseases')
      .then((r) => r.ok ? r.json() : { items: [] })
      .then((data) => setDiseases(data.items || []));
  }, []);

  useEffect(() => {
    fetch('/api/users')
      .then((r) => r.ok ? r.json() : { items: [] })
      .then((data) => setRecentUsers((data.items || []).slice(0, 8)));
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      fetchPosts(1, activeTab, false, sort, diseaseId);
      return;
    }
    const timer = setTimeout(() => {
      const params = new URLSearchParams({ search: search, limit: 20 });
      if (sort && sort !== 'date') params.set('sort', sort);
      if (diseaseId) params.set('diseaseId', diseaseId);
      fetch(`/api/posts?${params}`)
        .then((r) => r.json())
        .then((data) => { setPosts(data.items || []); setHasMore(false); });
    }, 300);
    return () => clearTimeout(timer);
  }, [search, activeTab, sort, diseaseId, fetchPosts]);

  const avatarColors = [
    'bg-primary-400/20 text-primary-400',
    'bg-sky-400/20 text-sky-400',
    'bg-rare-400/20 text-rare-400',
    'bg-rose-400/20 text-rose-400',
    'bg-emerald-400/20 text-emerald-400',
  ];

  const CATEGORY_LABELS = { topic: '话题', experience: '经验', question: '问答' };

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="text-center py-16 px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-3">社区</h1>
          <p className="text-gray-400 mb-8">Share your story. Support each other.</p>

          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="搜索话题、疾病..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-surface-800 border border-surface-600 rounded-xl text-white placeholder-gray-500 focus:border-primary-400 focus:ring-1 focus:ring-primary-400/20 outline-none transition"
            />
          </div>

          {/* Tabs */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setSearch(''); }}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-primary-400 text-black'
                    : 'bg-surface-800 text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* Content */}
        <section className="max-w-6xl mx-auto px-4 pb-20">
          <div className="flex gap-8">
            {/* Posts Grid */}
            <div className="flex-1">
              {/* Toolbar: New Post + Sort/Filter */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Sort Dropdown */}
                  <div className="relative">
                    <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="appearance-none pl-9 pr-8 py-2 bg-surface-800 border border-surface-600 rounded-lg text-sm text-gray-300 focus:border-primary-400 focus:ring-1 focus:ring-primary-400/20 outline-none transition cursor-pointer"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.key} value={opt.key}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                  </div>

                  {/* Disease Filter Dropdown */}
                  {diseases.length > 0 && (
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                      <select
                        value={diseaseId}
                        onChange={(e) => setDiseaseId(e.target.value)}
                        className="appearance-none pl-9 pr-8 py-2 bg-surface-800 border border-surface-600 rounded-lg text-sm text-gray-300 focus:border-primary-400 focus:ring-1 focus:ring-primary-400/20 outline-none transition cursor-pointer max-w-[200px]"
                      >
                        <option value="">全部病种</option>
                        {diseases.map((d) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                    </div>
                  )}
                </div>

                <Link
                  href="/posts/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-400 text-black rounded-xl text-sm font-semibold hover:bg-primary-300 transition-colors"
                >
                  <PenLine className="w-4 h-4" />
                  发帖
                </Link>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-surface-800 border border-surface-600 rounded-xl p-5 animate-pulse">
                      <div className="h-4 bg-surface-600 rounded w-3/4 mb-3" />
                      <div className="h-3 bg-surface-600 rounded w-full mb-2" />
                      <div className="h-3 bg-surface-600 rounded w-2/3" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {posts.map((post, idx) => (
                      <Link
                        key={post.id}
                        href={`/posts/${post.id}`}
                        className="bg-surface-800 border border-surface-600 rounded-xl p-5 hover:border-primary-400/50 transition-all group"
                      >
                        {/* Author row */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${avatarColors[idx % avatarColors.length]}`}>
                            {post.author?.[0] || '?'}
                          </div>
                          <span className="text-sm text-gray-400">{post.author}</span>
                          <div className="ml-auto flex items-center gap-1.5">
                            {post.category && CATEGORY_LABELS[post.category] && (
                              <span className="text-xs px-2 py-0.5 bg-surface-600 text-gray-400 rounded-full">{CATEGORY_LABELS[post.category]}</span>
                            )}
                            {post.disease && post.disease !== '综合' && (
                              <span className="text-xs px-2 py-0.5 bg-primary-400/10 text-primary-400 rounded-full">{post.disease}</span>
                            )}
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-white font-semibold mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">{post.title}</h3>

                        {/* Excerpt */}
                        <p className="text-gray-500 text-sm line-clamp-2 mb-4">{post.content}</p>

                        {/* Meta */}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5" />
                            {post.likes || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3.5 h-3.5" />
                            {post.replies || 0}
                          </span>
                          <span className="ml-auto">{timeAgo(post.date)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Load More */}
                  {hasMore && (
                    <div className="text-center mt-8">
                      <button
                        onClick={() => fetchPosts(page + 1, activeTab, true, sort, diseaseId)}
                        disabled={loadingMore}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-surface-800 border border-surface-600 text-gray-400 rounded-xl text-sm font-medium hover:text-white hover:border-primary-400/50 transition disabled:opacity-50"
                      >
                        <ChevronDown className="w-4 h-4" />
                        {loadingMore ? '加载中...' : '加载更多'}
                      </button>
                    </div>
                  )}
                </>
              )}

              {!loading && posts.length === 0 && (
                <div className="text-center py-20 text-gray-500">暂无帖子</div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:block w-72 shrink-0 space-y-6">
              {/* Trending Topics */}
              <div className="bg-surface-800 border border-surface-600 rounded-xl p-5">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary-400" />
                  热门话题
                </h3>
                <div className="space-y-3">
                  {topPosts.map((p) => (
                    <Link key={p.id} href={`/posts/${p.id}`} className="block text-sm text-gray-400 hover:text-white transition-colors line-clamp-1">
                      {p.title}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Recent Members */}
              <div className="bg-surface-800 border border-surface-600 rounded-xl p-5">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary-400" />
                  最近加入
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recentUsers.map((u, i) => (
                    <div
                      key={u.id || i}
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${avatarColors[i % avatarColors.length]}`}
                      title={u.username}
                    >
                      {u.username?.[0] || '?'}
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </>
  );
}
