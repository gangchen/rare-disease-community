'use client';

export default function HorizontalBar({ data, labelKey = 'label', valueKey = 'value', color = 'bg-primary-400', unit = '' }) {
  if (!data || data.length === 0) {
    return <p className="text-gray-500 text-sm text-center py-8">暂无数据</p>;
  }

  const max = Math.max(...data.map(d => d[valueKey]), 1);

  return (
    <div className="space-y-2">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-gray-400 w-24 truncate text-right shrink-0">{d[labelKey]}</span>
          <div className="flex-1 bg-surface-700 rounded-full h-5 overflow-hidden">
            <div
              className={`${color} h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
              style={{ width: `${Math.max((d[valueKey] / max) * 100, 8)}%` }}
            >
              <span className="text-[10px] font-medium text-black whitespace-nowrap">
                {d[valueKey]}{unit}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
