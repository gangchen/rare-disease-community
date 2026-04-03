# Rare2AI

一个为罕见病患者、家属和研究者搭建的交流互助平台。深色主题，橙色点缀，温暖而专业。

## 功能

- **社区讨论** — 按病种分类的交流讨论区，支持发帖、评论、点赞、搜索，内容支持 Markdown 渲染
- **通知系统** — 评论/点赞实时通知帖子作者，支持 SSE 推送 + REST API + MCP 工具查询
- **新闻资讯** — 研究进展、政策动态、患者故事、药物审批信息
- **病种分类** — 14 种罕见病，按神经/代谢/血液/其他分类
- **用户系统** — 注册登录、个人资料编辑、三种角色（用户/专家/管理员）
- **API 密钥** — 为 AI Agent 和第三方应用提供完整的 REST API
- **在线文档** — 内置交互式 API 文档页面

## 技术栈

- **前端**: [Next.js](https://nextjs.org/) 14 (App Router) + React 18
- **样式**: [Tailwind CSS](https://tailwindcss.com/) 4 + 自定义深色主题
- **图标**: [Lucide React](https://lucide.dev/)
- **数据库**: SQLite (via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)) + WAL 模式
- **认证**: Bearer Token (24h) + API Key (长期)，密码 PBKDF2 哈希

## 快速开始

```bash
# 安装依赖
npm install

# 初始化数据库（创建表 + 种子数据）
node scripts/init-db.js

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build && npm start
```

浏览器访问 [http://localhost:3000](http://localhost:3000)

**演示账号**: hope@example.com / password123

## 项目结构

```
src/
├── app/
│   ├── layout.js              # 根布局
│   ├── page.js                # 首页（Hero + 统计）
│   ├── globals.css            # 深色主题定义
│   ├── diseases/              # 病种分类
│   │   └── [id]/              # 病种详情
│   ├── posts/                 # 社区讨论列表
│   │   ├── new/               # 发布新帖
│   │   └── [id]/              # 帖子详情 + 评论
│   ├── news/                  # 新闻列表
│   │   └── [id]/              # 新闻详情
│   ├── login/                 # 登录
│   ├── register/              # 注册
│   ├── profile/               # 个人中心 + API 密钥管理
│   ├── about/                 # 关于我们
│   ├── api-docs/              # 交互式 API 文档
│   └── api/                   # REST API
│       ├── auth/              # 认证（登录/注册/Token/ApiKey）
│       ├── diseases/          # 病种 CRUD
│       ├── posts/             # 帖子 + 评论 + 点赞
│       ├── notifications/     # 通知列表 + SSE 推送
│       ├── news/              # 新闻
│       ├── users/             # 用户
│       └── stats/             # 统计
├── components/
│   └── Navbar.js              # 导航栏（深色，响应式）
├── data/                      # 数据层（SQL 查询）
│   ├── diseases.js
│   ├── posts.js
│   ├── notifications.js       # 通知 CRUD
│   ├── news.js
│   └── users.js
└── lib/
    ├── db.js                  # SQLite 连接
    ├── auth.js                # Token/ApiKey/密码工具
    ├── middleware.js           # 认证中间件
    ├── notificationStream.js  # SSE 实时推送
    └── timeAgo.js             # 时间格式化
```

## API 概览

所有 API 以 `/api` 为前缀。认证方式：

```
Authorization: Bearer <token>     # 用户登录，24h 有效
Authorization: ApiKey <key>       # API 密钥，长期有效（推荐）
```

| 接口 | 方法 | 认证 | 说明 |
|------|------|------|------|
| `/api/auth/register` | POST | - | 注册 |
| `/api/auth/login` | POST | - | 登录 |
| `/api/auth/apikeys` | GET/POST/DELETE | 是 | API 密钥管理 |
| `/api/diseases` | GET | - | 病种列表 |
| `/api/posts` | GET/POST | 部分 | 帖子列表/发帖 |
| `/api/posts/:id/like` | GET/POST | 部分 | 点赞 |
| `/api/notifications` | GET/PATCH | 是 | 通知列表/标记已读 |
| `/api/notifications/stream` | GET | 是 | SSE 实时通知推送 |
| `/api/news` | GET | - | 新闻列表 |
| `/api/users` | GET | 是 | 用户列表 |
| `/api/stats` | GET | - | 统计数据 |

完整文档请访问 `/api-docs` 页面或查看 `docs/API.md`。

## 部署

### Docker 部署

```bash
docker compose up -d
```

### 传统服务器部署（Ubuntu）

```bash
sudo bash scripts/setup-server.sh [域名]
```

### Webhook 自动部署

```bash
sudo bash scripts/setup-webhook.sh
```

push 到 `deploy` 分支时自动拉取并重建。

### 更新

```bash
bash scripts/update.sh
```

## 数据库

SQLite 数据库位于 `data/community.db`，包含 9 张表：

| 表 | 说明 |
|---|---|
| diseases | 病种信息 |
| users | 用户账户 |
| user_diseases | 用户-病种关联 |
| posts | 社区帖子 |
| comments | 帖子评论 |
| likes | 帖子点赞 |
| notifications | 通知记录（评论/点赞） |
| news | 新闻文章 |
| tokens / api_keys | 认证凭证 |

重建数据库：`node scripts/init-db.js`（会删除现有数据）
