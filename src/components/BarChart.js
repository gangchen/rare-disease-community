'use client';

export default function BarChart({ data, color = 'bg-primary-400', height = 'h-40', labelKey = 'label', valueKey = 'value' }) {
  if (!data || data.length === 0) {
    return <p className="text-gray-500 text-sm text-center py-8">暂无数据</p>;
  }

  const max = Math.max(...data.map(d => d[valueKey]), 1);

  return (
    <div className={`flex items-end gap-[2px] ${height}`}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center min-w-0 group relative">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-surface-700 text-xs text-gray-300 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
            {d[valueKey]}
          </div>
          <div
            className={`w-full ${color} rounded-t transition-all duration-300 min-h-[2px]`}
            style={{ height: `${(d[valueKey] / max) * 100}%` }}
          />
          {data.length <= 31 && (
            <span className="text-[10px] text-gray-500 mt-1 truncate w-full text-center">
              {d[labelKey]}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
