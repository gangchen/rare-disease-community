'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatBubble({ role, content, thinking }) {
  const isUser = role === 'user';

  if (thinking) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%] px-4 py-3 rounded-2xl bg-surface-700 border border-surface-600">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="inline-block w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
            正在{thinking === 'search_posts' ? '搜索社区帖子' :
              thinking === 'list_posts' ? '浏览帖子列表' :
              thinking === 'get_post_detail' ? '获取帖子详情' :
              thinking === 'create_post' ? '发布帖子' :
              thinking === 'find_diseases' ? '搜索疾病百科' :
              thinking === 'browse_news' ? '浏览新闻资讯' :
              thinking === 'get_health_profile' ? '获取健康画像' :
              thinking === 'get_risk_overview' ? '分析健康风险' :
              thinking === 'get_genomic_links' ? '查询基因关联' :
              thinking === 'get_full_records' ? '获取详细记录' :
              thinking === 'get_lab_genomic_summary' ? '分析化验基因关联' :
              thinking === 'submit_health_record' ? '提交健康数据' :
              thinking === 'get_user_info' ? '获取用户信息' :
              '思考中'}...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-primary-400 text-black rounded-br-md'
            : 'bg-surface-700 border border-surface-600 text-gray-200 rounded-bl-md'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-li:my-0 prose-headings:my-2 prose-pre:bg-surface-800 prose-pre:border prose-pre:border-surface-600">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
