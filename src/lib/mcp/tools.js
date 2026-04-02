import { z } from 'zod';
import { getAllPosts, getPostById, createPost, addComment, toggleLike, searchPosts } from '@/data/posts';
import { getAllUsers, getUserById } from '@/data/users';
import { getAllNews, getNewsById } from '@/data/news';
import { getNotifications, markAsRead } from '@/data/notifications';
import { getDb } from '@/lib/db';

function ok(text) {
  return { content: [{ type: 'text', text }] };
}

function err(text) {
  return { content: [{ type: 'text', text }], isError: true };
}

function formatPost(p) {
  return `[#${p.id}] ${p.title}\n  作者: ${p.author} | 病种: ${p.disease || '综合'} | 分类: ${p.category || 'topic'}\n  日期: ${p.date} | 浏览: ${p.views} | 点赞: ${p.likes || 0} | 评论: ${p.replies || 0}\n  ${p.content.slice(0, 200)}${p.content.length > 200 ? '...' : ''}`;
}

function formatNews(n) {
  return `[#${n.id}] ${n.title}\n  分类: ${n.category} | 日期: ${n.date}\n  ${n.summary || n.content.slice(0, 150)}`;
}

export function registerTools(server, authContext = null) {
  const userId = authContext?.userId;
  // ====== search_community ======
  server.tool(
    'search_community',
    'Search posts in the rare disease community by keyword',
    { query: z.string().describe('Search keyword'), limit: z.number().optional().describe('Max results (default 10)') },
    async ({ query, limit = 10 }) => {
      try {
        const posts = searchPosts(query);
        if (posts.length === 0) return ok(`没有找到与"${query}"相关的帖子。`);
        const results = posts.slice(0, limit).map(formatPost).join('\n\n');
        return ok(`找到 ${posts.length} 条结果（显示前 ${Math.min(limit, posts.length)} 条）：\n\n${results}`);
      } catch (e) {
        return err(`搜索失败: ${e.message}`);
      }
    }
  );

  // ====== get_post ======
  server.tool(
    'get_post',
    'Get full post details including all comments',
    { postId: z.number().describe('Post ID') },
    async ({ postId }) => {
      try {
        const post = getPostById(postId);
        if (!post) return err(`帖子 #${postId} 不存在。`);
        let text = `# ${post.title}\n\n作者: ${post.author} | 病种: ${post.disease} | 日期: ${post.date}\n浏览: ${post.views} | 点赞: ${post.likes} | 评论: ${post.replies}\n\n${post.content}`;
        if (post.comments.length > 0) {
          text += '\n\n---\n评论：\n';
          for (const c of post.comments) {
            text += `\n[${c.author}] (${c.date}): ${c.content}`;
          }
        }
        return ok(text);
      } catch (e) {
        return err(`获取帖子失败: ${e.message}`);
      }
    }
  );

  // ====== list_posts ======
  server.tool(
    'list_posts',
    'List community posts with optional filters',
    {
      page: z.number().optional().describe('Page number (default 1)'),
      limit: z.number().optional().describe('Posts per page (default 10)'),
      category: z.enum(['topic', 'experience', 'question']).optional().describe('Post category filter'),
      diseaseId: z.number().optional().describe('Filter by disease ID'),
      sort: z.enum(['date', 'views', 'replies']).optional().describe('Sort order (default date)')
    },
    async ({ page = 1, limit = 10, category, diseaseId, sort = 'date' }) => {
      try {
        const result = getAllPosts({ page, limit, category, diseaseId, sort });
        if (result.items.length === 0) return ok('暂无帖子。');
        const list = result.items.map(formatPost).join('\n\n');
        return ok(`帖子列表（第 ${page}/${result.totalPages} 页，共 ${result.total} 条）：\n\n${list}`);
      } catch (e) {
        return err(`获取帖子列表失败: ${e.message}`);
      }
    }
  );

  // ====== create_post ======
  server.tool(
    'create_post',
    'Publish a new post to the community (requires auth)',
    {
      title: z.string().describe('Post title'),
      content: z.string().describe('Post content'),
      category: z.enum(['topic', 'experience', 'question']).optional().describe('Post category (default topic)'),
      diseaseId: z.number().optional().describe('Related disease ID')
    },
    async ({ title, content, category = 'topic', diseaseId }) => {
      try {
        if (!userId) return err('需要登录才能发帖。请先配置 API Key。');
        const post = createPost({ title, content, category, authorId: userId, diseaseId });
        return ok(`帖子发布成功！\n\nID: ${post.id}\n标题: ${post.title}\n链接: https://rare2ai.com/posts/${post.id}`);
      } catch (e) {
        return err(`发帖失败: ${e.message}`);
      }
    }
  );

  // ====== reply_to_post ======
  server.tool(
    'reply_to_post',
    'Add a comment to a post (requires auth)',
    { postId: z.number().describe('Post ID'), content: z.string().describe('Comment content') },
    async ({ postId, content }) => {
      try {
        if (!userId) return err('需要登录才能评论。');
        const comment = addComment(postId, { authorId: userId, content });
        if (!comment) return err(`帖子 #${postId} 不存在。`);
        return ok(`评论成功！\n\n[${comment.author}]: ${comment.content}`);
      } catch (e) {
        return err(`评论失败: ${e.message}`);
      }
    }
  );

  // ====== like_post ======
  server.tool(
    'like_post',
    'Toggle like on a post (requires auth)',
    { postId: z.number().describe('Post ID') },
    async ({ postId }) => {
      try {
        if (!userId) return err('需要登录才能点赞。');
        const result = toggleLike(postId, userId);
        return ok(result.liked ? `已点赞！当前共 ${result.count} 个赞。` : `已取消点赞。当前共 ${result.count} 个赞。`);
      } catch (e) {
        return err(`点赞失败: ${e.message}`);
      }
    }
  );

  // ====== browse_news ======
  server.tool(
    'browse_news',
    'Browse latest rare disease news',
    {
      category: z.enum(['research', 'policy', 'patient_story', 'drug_approval']).optional().describe('News category'),
      page: z.number().optional(),
      limit: z.number().optional()
    },
    async ({ category, page = 1, limit = 10 }) => {
      try {
        const result = getAllNews({ page, limit, category });
        if (result.items.length === 0) return ok('暂无新闻。');
        const list = result.items.map(formatNews).join('\n\n');
        return ok(`新闻列表（第 ${page}/${result.totalPages} 页，共 ${result.total} 条）：\n\n${list}`);
      } catch (e) {
        return err(`获取新闻失败: ${e.message}`);
      }
    }
  );

  // ====== get_news ======
  server.tool(
    'get_news',
    'Get full news article details',
    { newsId: z.number().describe('News article ID') },
    async ({ newsId }) => {
      try {
        const article = getNewsById(newsId);
        if (!article) return err(`新闻 #${newsId} 不存在。`);
        return ok(`# ${article.title}\n\n分类: ${article.category} | 作者: ${article.author} | 日期: ${article.date}\n\n${article.summary ? `> ${article.summary}\n\n` : ''}${article.content}`);
      } catch (e) {
        return err(`获取新闻失败: ${e.message}`);
      }
    }
  );

  // ====== find_diseases ======
  server.tool(
    'find_diseases',
    'Search the rare disease directory',
    { query: z.string().optional().describe('Search keyword (optional, returns all if empty)') },
    async ({ query }) => {
      try {
        const db = getDb();
        let rows;
        if (query) {
          const pattern = `%${query}%`;
          rows = db.prepare('SELECT id, name, category, members, posts_count AS posts, description FROM diseases WHERE name LIKE ? OR description LIKE ? OR category LIKE ?').all(pattern, pattern, pattern);
        } else {
          rows = db.prepare('SELECT id, name, category, members, posts_count AS posts, description FROM diseases ORDER BY members DESC').all();
        }
        if (rows.length === 0) return ok(query ? `没有找到与"${query}"相关的病种。` : '暂无病种数据。');
        const list = rows.map(d => `[#${d.id}] ${d.name} (${d.category})\n  成员: ${d.members} | 帖子: ${d.posts}\n  ${d.description}`).join('\n\n');
        return ok(`病种目录（${rows.length} 条）：\n\n${list}`);
      } catch (e) {
        return err(`搜索病种失败: ${e.message}`);
      }
    }
  );

  // ====== get_community_stats ======
  server.tool(
    'get_community_stats',
    'Get community overview statistics',
    {},
    async () => {
      try {
        const db = getDb();
        const users = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
        const diseases = db.prepare('SELECT COUNT(*) AS c FROM diseases').get().c;
        const posts = db.prepare('SELECT COUNT(*) AS c FROM posts').get().c;
        const news = db.prepare('SELECT COUNT(*) AS c FROM news').get().c;
        const comments = db.prepare('SELECT COUNT(*) AS c FROM comments').get().c;
        const likes = db.prepare('SELECT COUNT(*) AS c FROM likes').get().c;
        return ok(`罕见病联盟社区统计：\n\n注册用户: ${users}\n收录病种: ${diseases}\n社区帖子: ${posts}\n新闻文章: ${news}\n评论总数: ${comments}\n点赞总数: ${likes}`);
      } catch (e) {
        return err(`获取统计失败: ${e.message}`);
      }
    }
  );

  // ====== get_notifications ======
  server.tool(
    'get_notifications',
    'Get user notifications (requires auth)',
    {
      unreadOnly: z.boolean().optional().describe('Only return unread notifications (default false)'),
      limit: z.number().optional().describe('Max results (default 20)')
    },
    async ({ unreadOnly = false, limit = 20 }) => {
      try {
        if (!userId) return err('需要登录才能查看通知。');
        const result = getNotifications(userId, { unreadOnly, limit });
        if (result.items.length === 0) return ok(unreadOnly ? '没有未读通知。' : '暂无通知。');
        const typeLabel = { comment: '评论', like: '点赞' };
        const list = result.items.map(n =>
          `${n.isRead ? '  ' : '🔴'} [#${n.id}] ${typeLabel[n.type] || n.type} — ${n.sourceUser} ${n.type === 'comment' ? '评论了' : '点赞了'}你的帖子「${n.postTitle}」 (${n.date})`
        ).join('\n');
        return ok(`通知列表（未读 ${result.unreadCount} 条，共 ${result.total} 条）：\n\n${list}`);
      } catch (e) {
        return err(`获取通知失败: ${e.message}`);
      }
    }
  );

  // ====== mark_notifications_read ======
  server.tool(
    'mark_notifications_read',
    'Mark notifications as read (requires auth)',
    {
      notificationIds: z.array(z.number()).optional().describe('Specific notification IDs to mark read (omit for all)')
    },
    async ({ notificationIds }) => {
      try {
        if (!userId) return err('需要登录。');
        markAsRead(userId, notificationIds);
        return ok(notificationIds ? `已标记 ${notificationIds.length} 条通知为已读。` : '已将所有通知标记为已读。');
      } catch (e) {
        return err(`操作失败: ${e.message}`);
      }
    }
  );

  // ====== find_similar_discussions ======
  server.tool(
    'find_similar_discussions',
    'Given a condition or symptom description, find relevant community posts',
    { description: z.string().describe('Condition, symptom, or topic description'), limit: z.number().optional().describe('Max results (default 5)') },
    async ({ description, limit = 5 }) => {
      try {
        const db = getDb();
        // Find matching diseases
        const pattern = `%${description}%`;
        const matchedDiseases = db.prepare('SELECT id, name FROM diseases WHERE name LIKE ? OR description LIKE ?').all(pattern, pattern);

        // Search posts by keyword
        const keywordPosts = searchPosts(description);

        // Search posts by matched diseases
        let diseasePosts = [];
        for (const d of matchedDiseases.slice(0, 3)) {
          const result = getAllPosts({ diseaseId: d.id, limit: 5, sort: 'replies' });
          diseasePosts.push(...result.items.map(p => ({ ...p, matchReason: `病种匹配: ${d.name}` })));
        }

        // Merge and deduplicate
        const seen = new Set();
        const merged = [];
        for (const p of [...diseasePosts, ...keywordPosts.map(p => ({ ...p, matchReason: '关键词匹配' }))]) {
          if (!seen.has(p.id)) {
            seen.add(p.id);
            merged.push(p);
          }
        }

        if (merged.length === 0) return ok(`没有找到与"${description}"相关的讨论。建议发个帖子寻求帮助！`);

        const results = merged.slice(0, limit).map(p =>
          `[#${p.id}] ${p.title} (${p.matchReason || '匹配'})\n  作者: ${p.author} | 评论: ${p.replies || 0} | 点赞: ${p.likes || 0}\n  ${(p.content || '').slice(0, 120)}...`
        ).join('\n\n');

        return ok(`找到 ${merged.length} 条相关讨论（显示前 ${Math.min(limit, merged.length)} 条）：\n\n${results}`);
      } catch (e) {
        return err(`搜索失败: ${e.message}`);
      }
    }
  );
}
