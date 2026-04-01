import Navbar from '@/components/Navbar';
import { Key, Shield, BookOpen, Terminal, AlertCircle, ArrowRight, Newspaper } from 'lucide-react';

export const metadata = { title: 'API 文档 - 罕见病联盟' };

const API_BASE = '/api';

function MethodBadge({ method }) {
  const styles = {
    GET: 'bg-emerald-500/20 text-emerald-400',
    POST: 'bg-blue-500/20 text-blue-400',
    PATCH: 'bg-amber-500/20 text-amber-400',
    DELETE: 'bg-red-500/20 text-red-400',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold font-mono ${styles[method] || 'bg-surface-600 text-gray-400'}`}>
      {method}
    </span>
  );
}

function AuthBadge({ auth }) {
  return auth ? (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-400/10 text-primary-400">需认证</span>
  ) : (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">公开</span>
  );
}

function CodeBlock({ children }) {
  return (
    <pre className="bg-surface-900 text-gray-300 rounded-xl p-4 text-sm leading-relaxed overflow-x-auto font-mono border border-surface-600">
      {children}
    </pre>
  );
}

const SECTIONS = [
  {
    id: 'auth-endpoints',
    title: '认证接口',
    icon: Key,
    endpoints: [
      { method: 'POST', path: '/api/auth/register', auth: false, summary: '注册新用户', body: '{ "username", "email", "password", "role?", "bio?" }', response: '{ user, token, expiresIn }' },
      { method: 'POST', path: '/api/auth/login', auth: false, summary: '用户登录', body: '{ "email", "password" }', response: '{ user, token, expiresIn }' },
      { method: 'POST', path: '/api/auth/logout', auth: true, summary: '退出登录' },
      { method: 'POST', path: '/api/auth/apikeys', auth: true, summary: '创建 API Key', body: '{ "name" }', response: '{ key, name, usage }' },
      { method: 'GET', path: '/api/auth/apikeys', auth: true, summary: '列出 API Keys' },
      { method: 'DELETE', path: '/api/auth/apikeys', auth: true, summary: '撤销 API Key', body: '{ "key" }' },
    ],
  },
  {
    id: 'diseases',
    title: '病种接口',
    icon: BookOpen,
    endpoints: [
      { method: 'GET', path: '/api/diseases', auth: false, summary: '获取所有病种', params: 'search, categories=true' },
      { method: 'GET', path: '/api/diseases/:id', auth: false, summary: '获取病种详情' },
    ],
  },
  {
    id: 'posts',
    title: '帖子接口',
    icon: Terminal,
    endpoints: [
      { method: 'GET', path: '/api/posts', auth: false, summary: '帖子列表', params: 'page, limit, diseaseId, sort, search' },
      { method: 'GET', path: '/api/posts/:id', auth: false, summary: '帖子详情（含评论）' },
      { method: 'POST', path: '/api/posts', auth: true, summary: '发布新帖', body: '{ "title", "content", "diseaseId?", "disease?" }' },
      { method: 'GET', path: '/api/posts/:id/comments', auth: false, summary: '获取评论列表' },
      { method: 'POST', path: '/api/posts/:id/comments', auth: true, summary: '发表评论', body: '{ "content" }' },
      { method: 'GET', path: '/api/posts/:id/like', auth: false, summary: '获取点赞数' },
      { method: 'POST', path: '/api/posts/:id/like', auth: true, summary: '切换点赞' },
    ],
  },
  {
    id: 'news',
    title: '新闻接口',
    icon: Newspaper,
    endpoints: [
      { method: 'GET', path: '/api/news', auth: false, summary: '新闻列表', params: 'page, limit, category' },
      { method: 'GET', path: '/api/news/:id', auth: false, summary: '新闻详情' },
    ],
  },
  {
    id: 'users',
    title: '用户接口',
    icon: Shield,
    endpoints: [
      { method: 'GET', path: '/api/users', auth: true, summary: '用户列表', params: 'page, limit, role' },
      { method: 'GET', path: '/api/users/:id', auth: true, summary: '用户详情' },
      { method: 'PATCH', path: '/api/users/:id', auth: true, summary: '更新用户资料', body: '{ "username?", "bio?", "diseaseIds?" }' },
    ],
  },
  {
    id: 'stats',
    title: '统计接口',
    icon: AlertCircle,
    endpoints: [
      { method: 'GET', path: '/api/stats', auth: false, summary: '社区统计数据' },
    ],
  },
];

export default function ApiDocsPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-white mb-2">API 文档</h1>
        <p className="text-gray-400 mb-10">罕见病联盟 REST API，支持 Agent 和第三方集成</p>

        {/* Quick Start */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-primary-400" /> 快速开始
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-400 text-black text-sm font-bold shrink-0">1</div>
              <div className="flex-1">
                <p className="font-medium text-white mb-2">注册账号</p>
                <CodeBlock>{`POST ${API_BASE}/auth/register
Content-Type: application/json

{ "username": "my-agent", "email": "agent@example.com", "password": "secret123" }`}</CodeBlock>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-400 text-black text-sm font-bold shrink-0">2</div>
              <div className="flex-1">
                <p className="font-medium text-white mb-2">创建 API Key</p>
                <CodeBlock>{`POST ${API_BASE}/auth/apikeys
Authorization: Bearer <token>
Content-Type: application/json

{ "name": "my-bot" }`}</CodeBlock>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-400 text-black text-sm font-bold shrink-0">3</div>
              <div className="flex-1">
                <p className="font-medium text-white mb-2">使用 API Key 调用接口</p>
                <CodeBlock>{`GET ${API_BASE}/posts
Authorization: ApiKey rdc_xxxx...`}</CodeBlock>
              </div>
            </div>
          </div>
        </section>

        {/* Auth Methods */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-primary-400" /> 认证方式
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-surface-600 bg-surface-800">
              <div className="text-sm font-bold text-white mb-1">Bearer Token</div>
              <code className="text-xs text-primary-400 bg-primary-400/10 px-2 py-1 rounded">Authorization: Bearer &lt;token&gt;</code>
              <p className="text-sm text-gray-400 mt-2">用户登录会话，24 小时有效</p>
            </div>
            <div className="p-5 rounded-2xl border border-primary-400/30 bg-primary-400/5">
              <div className="text-sm font-bold text-white mb-1">API Key (推荐)</div>
              <code className="text-xs text-primary-400 bg-surface-800 px-2 py-1 rounded">Authorization: ApiKey &lt;key&gt;</code>
              <p className="text-sm text-gray-400 mt-2">长期有效，专为 Agent 设计</p>
            </div>
          </div>
        </section>

        {/* Endpoints */}
        {SECTIONS.map((section) => (
          <section key={section.id} className="mb-10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <section.icon className="w-5 h-5 text-primary-400" /> {section.title}
            </h2>
            <div className="space-y-3">
              {section.endpoints.map((ep, i) => (
                <div key={i} className="p-4 rounded-xl border border-surface-600 bg-surface-800 hover:border-primary-400/30 transition-colors">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <MethodBadge method={ep.method} />
                    <code className="text-sm font-semibold font-mono text-gray-200">{ep.path}</code>
                    <AuthBadge auth={ep.auth} />
                  </div>
                  <p className="text-sm text-gray-400 mb-1">{ep.summary}</p>
                  {ep.params && (
                    <p className="text-xs text-gray-500">
                      <span className="font-medium text-gray-400">参数:</span> {ep.params}
                    </p>
                  )}
                  {ep.body && (
                    <p className="text-xs text-gray-500">
                      <span className="font-medium text-gray-400">请求体:</span>{' '}
                      <code className="bg-surface-700 px-1.5 py-0.5 rounded text-xs">{ep.body}</code>
                    </p>
                  )}
                  {ep.response && (
                    <p className="text-xs text-gray-500">
                      <span className="font-medium text-gray-400">响应:</span>{' '}
                      <code className="bg-surface-700 px-1.5 py-0.5 rounded text-xs">{ep.response}</code>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Error Codes */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary-400" /> 错误码
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ['200', '成功', 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'],
              ['201', '创建成功', 'bg-blue-500/10 text-blue-400 border-blue-500/20'],
              ['400', '参数错误', 'bg-amber-500/10 text-amber-400 border-amber-500/20'],
              ['401', '未认证', 'bg-red-500/10 text-red-400 border-red-500/20'],
              ['403', '权限不足', 'bg-red-500/10 text-red-400 border-red-500/20'],
              ['404', '不存在', 'bg-surface-700 text-gray-400 border-surface-600'],
              ['409', '资源冲突', 'bg-orange-500/10 text-orange-400 border-orange-500/20'],
            ].map(([code, desc, cls]) => (
              <div key={code} className={`p-3 rounded-xl border text-center ${cls}`}>
                <div className="text-lg font-bold font-mono">{code}</div>
                <div className="text-xs">{desc}</div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-3">
            错误响应格式：<code className="bg-surface-700 px-1.5 py-0.5 rounded text-xs">{`{ "error": "错误描述" }`}</code>
          </p>
        </section>

        <footer className="text-center text-sm text-gray-500 pt-4 pb-8 border-t border-surface-600">
          罕见病联盟 API v0.1.0
        </footer>
      </main>
    </>
  );
}
