import { searchPosts, getAllPosts, getPostById, createPost, addComment } from '@/data/posts';
import { getAllNews, getNewsById } from '@/data/news';
import { getDb } from '@/lib/db';
import { Gene2aiClient } from './gene2ai';

/**
 * Tool definitions for Gemini function calling.
 * Each tool has: name, description, parameters (JSON Schema), execute(args, context).
 */

// ========== Rare2AI Community Tools ==========

const search_posts = {
  name: 'search_posts',
  description: '在罕见病社区中按关键词搜索帖子（经验分享、治疗记录、求助帖等）',
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string', description: '搜索关键词' },
      limit: { type: 'integer', description: '最大返回数量（默认10）' },
    },
    required: ['query'],
  },
  execute({ query, limit = 10 }) {
    const posts = searchPosts(query);
    if (posts.length === 0) return `没有找到与"${query}"相关的帖子。`;
    return posts.slice(0, limit).map(p =>
      `[#${p.id}] ${p.title}\n  作者: ${p.author} | 病种: ${p.disease || '综合'} | 分类: ${p.category}\n  日期: ${p.date} | 浏览: ${p.views} | 点赞: ${p.likes || 0}\n  ${p.content.slice(0, 200)}...`
    ).join('\n\n');
  },
};

const list_posts = {
  name: 'list_posts',
  description: '按分类或病种列出社区帖子',
  parameters: {
    type: 'object',
    properties: {
      category: { type: 'string', enum: ['topic', 'experience', 'question'], description: '帖子分类' },
      diseaseId: { type: 'integer', description: '病种ID' },
      sort: { type: 'string', enum: ['date', 'views', 'replies'], description: '排序方式' },
      page: { type: 'integer', description: '页码' },
      limit: { type: 'integer', description: '每页数量' },
    },
  },
  execute({ category, diseaseId, sort = 'date', page = 1, limit = 10 }) {
    const result = getAllPosts({ page, limit, category, diseaseId, sort });
    if (result.items.length === 0) return '暂无帖子。';
    const list = result.items.map(p =>
      `[#${p.id}] ${p.title}\n  作者: ${p.author} | 病种: ${p.disease || '综合'} | 日期: ${p.date} | 浏览: ${p.views}`
    ).join('\n\n');
    return `帖子列表（第 ${page}/${result.totalPages} 页，共 ${result.total} 条）：\n\n${list}`;
  },
};

const get_post_detail = {
  name: 'get_post_detail',
  description: '获取帖子详情和所有评论',
  parameters: {
    type: 'object',
    properties: {
      postId: { type: 'integer', description: '帖子ID' },
    },
    required: ['postId'],
  },
  execute({ postId }) {
    const post = getPostById(postId);
    if (!post) return `帖子 #${postId} 不存在。`;
    let text = `# ${post.title}\n\n作者: ${post.author} | 病种: ${post.disease} | 日期: ${post.date}\n浏览: ${post.views} | 点赞: ${post.likes} | 评论: ${post.replies}\n\n${post.content}`;
    if (post.comments.length > 0) {
      text += '\n\n---\n评论：\n';
      for (const c of post.comments) {
        text += `\n[${c.author}] (${c.date}): ${c.content}`;
      }
    }
    return text;
  },
};

const create_post = {
  name: 'create_post',
  description: '代替用户在社区发布帖子（需要用户已登录）',
  parameters: {
    type: 'object',
    properties: {
      title: { type: 'string', description: '帖子标题' },
      content: { type: 'string', description: '帖子内容' },
      category: { type: 'string', enum: ['topic', 'experience', 'question'], description: '帖子分类' },
      diseaseId: { type: 'integer', description: '关联病种ID' },
    },
    required: ['title', 'content'],
  },
  execute({ title, content, category = 'topic', diseaseId }, context) {
    if (!context.userId) return '需要登录才能发帖。请先登录账号。';
    const post = createPost({ title, content, category, authorId: context.userId, diseaseId });
    return `帖子发布成功！\n\nID: ${post.id}\n标题: ${post.title}`;
  },
};

const find_diseases = {
  name: 'find_diseases',
  description: '搜索罕见病百科（按名称、分类或描述）',
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string', description: '搜索关键词（留空返回全部）' },
    },
  },
  execute({ query }) {
    const db = getDb();
    let rows;
    if (query) {
      const pattern = `%${query}%`;
      rows = db.prepare('SELECT id, name, category, members, posts_count, description FROM diseases WHERE name LIKE ? OR description LIKE ? OR category LIKE ?').all(pattern, pattern, pattern);
    } else {
      rows = db.prepare('SELECT id, name, category, members, posts_count, description FROM diseases ORDER BY members DESC').all();
    }
    if (rows.length === 0) return query ? `没有找到与"${query}"相关的病种。` : '暂无病种数据。';
    return rows.map(d => `[#${d.id}] ${d.name} (${d.category})\n  成员: ${d.members} | 帖子: ${d.posts_count}\n  ${d.description}`).join('\n\n');
  },
};

const browse_news = {
  name: 'browse_news',
  description: '浏览罕见病新闻资讯',
  parameters: {
    type: 'object',
    properties: {
      category: { type: 'string', enum: ['research', 'policy', 'patient_story', 'drug_approval'], description: '新闻分类' },
      limit: { type: 'integer', description: '返回数量（默认5）' },
    },
  },
  execute({ category, limit = 5 }) {
    const result = getAllNews({ page: 1, limit, category });
    if (result.items.length === 0) return '暂无新闻。';
    return result.items.map(n =>
      `[#${n.id}] ${n.title}\n  分类: ${n.category} | 日期: ${n.date}\n  ${n.summary || n.content.slice(0, 150)}`
    ).join('\n\n');
  },
};

// ========== Gene2.ai Health Tools ==========

function getGene2aiClient(context) {
  if (!context.gene2aiKey) {
    return null;
  }
  return new Gene2aiClient(context.gene2aiKey);
}

const get_health_profile = {
  name: 'get_health_profile',
  description: '获取用户的健康画像（APOE基因型、CYP450代谢状态、HLA、健康风险、用药敏感性、营养标记、异常指标）。推荐首选，数据量小(~2-4KB)，包含结论性信息。',
  parameters: { type: 'object', properties: {} },
  async execute(_, context) {
    const client = getGene2aiClient(context);
    if (!client) return '尚未绑定 Gene2AI 健康账号。请前往「个人中心」绑定 Gene2AI API Key 后再试。';
    const data = await client.getProfile();
    return JSON.stringify(data, null, 2);
  },
};

const get_risk_overview = {
  name: 'get_risk_overview',
  description: '获取综合风险面板：基因风险（含SNP）、异常化验指标、基因与化验的交叉分析',
  parameters: { type: 'object', properties: {} },
  async execute(_, context) {
    const client = getGene2aiClient(context);
    if (!client) return '尚未绑定 Gene2AI 健康账号。请前往「个人中心」绑定 Gene2AI API Key。';
    const data = await client.getRiskOverview();
    return JSON.stringify(data, null, 2);
  },
};

const get_genomic_links = {
  name: 'get_genomic_links',
  description: '查询某项化验指标的相关基因变异。支持: TC, TG, LDL-C, HDL-C, SBP, DBP, FBG, HbA1c, BMI, UA, TSH, FT3, FT4, ALT, AST, GGT, ALP, TBIL, SCr, BUN, WBC, HGB, PLT, CRP',
  parameters: {
    type: 'object',
    properties: {
      indicatorCode: { type: 'string', description: '化验指标代码，如 LDL-C, FBG, TSH 等' },
    },
    required: ['indicatorCode'],
  },
  async execute({ indicatorCode }, context) {
    const client = getGene2aiClient(context);
    if (!client) return '尚未绑定 Gene2AI 健康账号。请前往「个人中心」绑定 Gene2AI API Key。';
    const data = await client.getGenomicLinks(indicatorCode);
    return JSON.stringify(data, null, 2);
  },
};

const get_full_records = {
  name: 'get_full_records',
  description: '获取详细健康记录（基因型、化验值等）。数据量较大(50-500KB)，仅在用户需要具体数值时使用',
  parameters: {
    type: 'object',
    properties: {
      category: { type: 'string', enum: ['genomic', 'lab_result', 'checkup', 'self_reported', 'medical_record', 'imaging'], description: '数据类型' },
      subcategory: { type: 'string', enum: ['health_risk', 'drug_response', 'trait', 'nutrition', 'ancestry', 'apoe', 'hla', 'cyp450'], description: '基因数据子分类' },
    },
  },
  async execute({ category, subcategory }, context) {
    const client = getGene2aiClient(context);
    if (!client) return '尚未绑定 Gene2AI 健康账号。请前往「个人中心」绑定 Gene2AI API Key。';
    const data = await client.getFullRecords({ category, subcategory, format: 'grouped' });
    return JSON.stringify(data, null, 2);
  },
};

const get_lab_genomic_summary = {
  name: 'get_lab_genomic_summary',
  description: '获取所有化验指标及其关联基因记录数，用于了解哪些化验指标有基因层面的解读',
  parameters: { type: 'object', properties: {} },
  async execute(_, context) {
    const client = getGene2aiClient(context);
    if (!client) return '尚未绑定 Gene2AI 健康账号。请前往「个人中心」绑定 Gene2AI API Key。';
    const data = await client.getLabGenomicSummary();
    return JSON.stringify(data, null, 2);
  },
};

const submit_health_record = {
  name: 'submit_health_record',
  description: '提交用户自报的健康数据（血压、血糖、心率、体温、BMI等）',
  parameters: {
    type: 'object',
    properties: {
      title: { type: 'string', description: '记录描述，如"今日血压"' },
      records: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            indicatorName: { type: 'string', description: '指标英文名' },
            indicatorNameZh: { type: 'string', description: '指标中文名' },
            valueNumeric: { type: 'number', description: '数值' },
            valueUnit: { type: 'string', description: '单位' },
            refRangeLow: { type: 'number', description: '参考范围下限' },
            refRangeHigh: { type: 'number', description: '参考范围上限' },
            abnormalFlag: { type: 'string', enum: ['normal', 'high', 'low', 'critical_high', 'critical_low'], description: '异常标志' },
          },
          required: ['indicatorName', 'indicatorNameZh', 'valueNumeric', 'valueUnit', 'abnormalFlag'],
        },
        description: '健康指标数组',
      },
    },
    required: ['title', 'records'],
  },
  async execute({ title, records }, context) {
    const client = getGene2aiClient(context);
    if (!client) return '尚未绑定 Gene2AI 健康账号。请前往「个人中心」绑定 Gene2AI API Key。';
    const today = new Date().toISOString().split('T')[0];
    const data = await client.submitRecords({
      category: 'self_reported',
      title,
      documentDate: today,
      records,
    });
    return `数据已提交成功。${records.some(r => r.abnormalFlag !== 'normal') ? '\n注意：部分指标超出参考范围，请关注。' : ''}`;
  },
};

// ========== Helper Tools ==========

const get_current_time = {
  name: 'get_current_time',
  description: '获取当前日期和时间',
  parameters: { type: 'object', properties: {} },
  execute() {
    const now = new Date();
    return `当前时间: ${now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })} (北京时间)`;
  },
};

const get_user_info = {
  name: 'get_user_info',
  description: '获取当前登录用户的信息和关注的疾病',
  parameters: { type: 'object', properties: {} },
  execute(_, context) {
    if (!context.userId) return '用户未登录。';
    const db = getDb();
    const user = db.prepare('SELECT id, username, role, bio FROM users WHERE id = ?').get(context.userId);
    if (!user) return '用户不存在。';
    const diseases = db.prepare(
      'SELECT d.id, d.name FROM user_diseases ud JOIN diseases d ON d.id = ud.disease_id WHERE ud.user_id = ?'
    ).all(context.userId);
    const diseaseList = diseases.length > 0 ? diseases.map(d => d.name).join('、') : '暂无关注的疾病';
    return `用户: ${user.username} (ID: ${user.id})\n角色: ${user.role}\n简介: ${user.bio || '暂无'}\n关注疾病: ${diseaseList}`;
  },
};

// ========== Export all tools ==========

export const ALL_TOOLS = [
  // Community
  search_posts,
  list_posts,
  get_post_detail,
  create_post,
  find_diseases,
  browse_news,
  // Gene2.ai
  get_health_profile,
  get_risk_overview,
  get_genomic_links,
  get_full_records,
  get_lab_genomic_summary,
  submit_health_record,
  // Helpers
  get_current_time,
  get_user_info,
];

/**
 * Convert tools to Gemini function declarations format.
 */
export function getGeminiFunctionDeclarations() {
  return ALL_TOOLS.map(t => ({
    name: t.name,
    description: t.description,
    parameters: t.parameters,
  }));
}

/**
 * Execute a tool by name.
 */
export async function executeTool(name, args, context) {
  const tool = ALL_TOOLS.find(t => t.name === name);
  if (!tool) return `未知工具: ${name}`;
  try {
    return await tool.execute(args, context);
  } catch (err) {
    return `工具执行失败 (${name}): ${err.message}`;
  }
}
