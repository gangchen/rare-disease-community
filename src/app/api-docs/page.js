import Navbar from '@/components/Navbar';
import styles from './docs.module.css';

export const metadata = {
  title: 'API 文档 - 罕见病社区',
};

const API_BASE = 'http://localhost:3000/api';

const SECTIONS = [
  {
    id: 'auth',
    title: '认证方式',
    description: '支持两种认证方式，Agent 推荐使用 API Key。',
    endpoints: [],
  },
  {
    id: 'auth-endpoints',
    title: '认证接口',
    endpoints: [
      {
        method: 'POST',
        path: '/api/auth/register',
        auth: false,
        summary: '注册新用户',
        body: '{ "username": "string", "email": "string", "password": "string", "role?": "user|expert", "bio?": "string" }',
        response: '{ "user": {...}, "token": "string", "expiresIn": 86400 }',
      },
      {
        method: 'POST',
        path: '/api/auth/login',
        auth: false,
        summary: '用户登录',
        body: '{ "email": "string", "password": "string" }',
        response: '{ "user": { "id", "username", "role" }, "token": "string", "expiresIn": 86400 }',
      },
      {
        method: 'POST',
        path: '/api/auth/logout',
        auth: true,
        summary: '退出登录',
        body: null,
        response: '{ "message": "已退出登录" }',
      },
      {
        method: 'POST',
        path: '/api/auth/apikeys',
        auth: true,
        summary: '创建 API Key',
        body: '{ "name": "string" }',
        response: '{ "key": "rdc_...", "name": "string", "usage": "Authorization: ApiKey <key>" }',
      },
      {
        method: 'GET',
        path: '/api/auth/apikeys',
        auth: true,
        summary: '列出 API Keys',
        body: null,
        response: '{ "items": [{ "key": "rdc_ab...f1", "name", "active", "createdAt" }] }',
      },
      {
        method: 'DELETE',
        path: '/api/auth/apikeys',
        auth: true,
        summary: '撤销 API Key',
        body: '{ "key": "rdc_..." }',
        response: '{ "message": "API Key 已撤销" }',
      },
    ],
  },
  {
    id: 'diseases',
    title: '病种接口',
    endpoints: [
      {
        method: 'GET',
        path: '/api/diseases',
        auth: false,
        summary: '获取所有病种',
        params: 'search: 搜索关键词 | categories=true: 返回分类汇总',
        response: '{ "items": [{ "id", "name", "category", "members", "posts", "description" }], "total": number }',
      },
      {
        method: 'GET',
        path: '/api/diseases/:id',
        auth: false,
        summary: '获取病种详情',
        response: '{ "id", "name", "category", "members", "posts", "description" }',
      },
    ],
  },
  {
    id: 'posts',
    title: '帖子接口',
    endpoints: [
      {
        method: 'GET',
        path: '/api/posts',
        auth: false,
        summary: '获取帖子列表',
        params: 'page, limit, diseaseId, sort(date|views|replies), search',
        response: '{ "items": [...], "total", "page", "limit", "totalPages" }',
      },
      {
        method: 'GET',
        path: '/api/posts/:id',
        auth: false,
        summary: '获取帖子详情（含评论）',
        response: '{ "id", "title", "content", "author", "disease", "comments": [...] }',
      },
      {
        method: 'POST',
        path: '/api/posts',
        auth: true,
        summary: '发布新帖子',
        body: '{ "title": "string", "content": "string", "diseaseId?": number, "disease?": "string" }',
        response: '{ "id", "title", "content", "author", "date", ... }',
      },
      {
        method: 'GET',
        path: '/api/posts/:id/comments',
        auth: false,
        summary: '获取评论列表',
        response: '{ "items": [{ "id", "author", "content", "date" }], "total" }',
      },
      {
        method: 'POST',
        path: '/api/posts/:id/comments',
        auth: true,
        summary: '发表评论',
        body: '{ "content": "string" }',
        response: '{ "id", "author", "authorId", "content", "date" }',
      },
    ],
  },
  {
    id: 'users',
    title: '用户接口',
    endpoints: [
      {
        method: 'GET',
        path: '/api/users',
        auth: true,
        summary: '获取用户列表',
        params: 'page, limit, role(user|expert|admin)',
        response: '{ "items": [{ "id", "username", "role", "bio", ... }], "total", ... }',
      },
      {
        method: 'GET',
        path: '/api/users/:id',
        auth: true,
        summary: '获取用户详情',
        response: '{ "id", "username", "role", "diseaseIds", "joinDate", "bio" }',
      },
      {
        method: 'PATCH',
        path: '/api/users/:id',
        auth: true,
        summary: '更新用户资料（仅自己或 admin）',
        body: '{ "username?": "string", "bio?": "string", "diseaseIds?": [number] }',
        response: '{ "id", "username", "role", "bio", ... }',
      },
    ],
  },
  {
    id: 'stats',
    title: '统计接口',
    endpoints: [
      {
        method: 'GET',
        path: '/api/stats',
        auth: false,
        summary: '获取社区统计数据',
        response: '{ "users", "diseases", "posts", "totalMembers", "topDiseases": [...], "recentActivity": {...} }',
      },
    ],
  },
];

function MethodBadge({ method }) {
  const colors = {
    GET: '#10b981',
    POST: '#3b82f6',
    PATCH: '#f59e0b',
    DELETE: '#ef4444',
  };
  return (
    <span
      style={{
        background: colors[method] || '#6b7280',
        color: 'white',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: 700,
        fontFamily: 'monospace',
      }}
    >
      {method}
    </span>
  );
}

export default function ApiDocsPage() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <h1 className={styles.title}>API 文档</h1>
        <p className={styles.subtitle}>
          罕见病社区 REST API，支持 Agent 和第三方集成
        </p>

        {/* Quick Start */}
        <section className={styles.section}>
          <h2 id="quickstart">快速开始</h2>
          <div className={styles.steps}>
            <div className={styles.step}>
              <span className={styles.stepNum}>1</span>
              <div>
                <strong>注册账号</strong>
                <pre className={styles.code}>
{`POST ${API_BASE}/auth/register
Content-Type: application/json

{
  "username": "my-agent",
  "email": "agent@example.com",
  "password": "secret123"
}`}
                </pre>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNum}>2</span>
              <div>
                <strong>创建 API Key</strong>
                <pre className={styles.code}>
{`POST ${API_BASE}/auth/apikeys
Authorization: Bearer <上一步返回的 token>
Content-Type: application/json

{ "name": "my-bot" }`}
                </pre>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNum}>3</span>
              <div>
                <strong>使用 API Key 调用接口</strong>
                <pre className={styles.code}>
{`GET ${API_BASE}/posts
Authorization: ApiKey rdc_xxxx...`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Auth Methods */}
        <section className={styles.section}>
          <h2 id="auth">认证方式</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>方式</th>
                <th>Header</th>
                <th>有效期</th>
                <th>适用场景</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Bearer Token</td>
                <td><code>Authorization: Bearer &lt;token&gt;</code></td>
                <td>24 小时</td>
                <td>用户会话</td>
              </tr>
              <tr>
                <td>API Key</td>
                <td><code>Authorization: ApiKey &lt;key&gt;</code></td>
                <td>长期有效</td>
                <td>Agent / 第三方</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Endpoints */}
        {SECTIONS.filter((s) => s.endpoints.length > 0).map((section) => (
          <section key={section.id} className={styles.section}>
            <h2 id={section.id}>{section.title}</h2>
            <div className={styles.endpointList}>
              {section.endpoints.map((ep, i) => (
                <div key={i} className={styles.endpoint}>
                  <div className={styles.endpointHeader}>
                    <MethodBadge method={ep.method} />
                    <code className={styles.path}>{ep.path}</code>
                    {ep.auth ? (
                      <span className={styles.authBadge}>需认证</span>
                    ) : (
                      <span className={styles.publicBadge}>公开</span>
                    )}
                  </div>
                  <p className={styles.summary}>{ep.summary}</p>
                  {ep.params && (
                    <div className={styles.detail}>
                      <span className={styles.detailLabel}>参数:</span>
                      <code>{ep.params}</code>
                    </div>
                  )}
                  {ep.body && (
                    <div className={styles.detail}>
                      <span className={styles.detailLabel}>请求体:</span>
                      <pre className={styles.codeInline}>{ep.body}</pre>
                    </div>
                  )}
                  <div className={styles.detail}>
                    <span className={styles.detailLabel}>响应:</span>
                    <pre className={styles.codeInline}>{ep.response}</pre>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Error Codes */}
        <section className={styles.section}>
          <h2 id="errors">错误码</h2>
          <table className={styles.table}>
            <thead>
              <tr><th>状态码</th><th>含义</th></tr>
            </thead>
            <tbody>
              <tr><td>200</td><td>请求成功</td></tr>
              <tr><td>201</td><td>创建成功</td></tr>
              <tr><td>400</td><td>请求参数错误</td></tr>
              <tr><td>401</td><td>未认证 / Token 过期</td></tr>
              <tr><td>403</td><td>权限不足</td></tr>
              <tr><td>404</td><td>资源不存在</td></tr>
              <tr><td>409</td><td>资源冲突</td></tr>
            </tbody>
          </table>
          <p className={styles.note}>
            错误响应统一格式：<code>{`{ "error": "错误描述" }`}</code>
          </p>
        </section>

        <footer className={styles.footer}>
          <p>罕见病社区 API v0.1.0</p>
        </footer>
      </main>
    </>
  );
}
