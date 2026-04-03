'use client';

import { Search, FileHeart, Newspaper } from 'lucide-react';

const ACTIONS = [
  {
    icon: Search,
    label: '找病友',
    message: '帮我搜索社区里关于罕见病的经验分享',
    color: 'text-blue-400',
  },
  {
    icon: FileHeart,
    label: '看报告',
    message: '帮我解读最新的健康报告',
    color: 'text-green-400',
  },
  {
    icon: Newspaper,
    label: '今日摘要',
    message: '给我今天的社区动态和罕见病新闻',
    color: 'text-amber-400',
  },
];

export default function QuickActions({ onAction, disabled }) {
  return (
    <div className="flex gap-2 justify-center flex-wrap">
      {ACTIONS.map((action) => (
        <button
          key={action.label}
          onClick={() => onAction(action.message)}
          disabled={disabled}
          className="flex items-center gap-2 px-4 py-2.5 bg-surface-700 border border-surface-600 rounded-xl text-sm font-medium text-gray-300 hover:border-primary-400/50 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <action.icon className={`w-4 h-4 ${action.color}`} />
          {action.label}
        </button>
      ))}
    </div>
  );
}
