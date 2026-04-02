import Navbar from '@/components/Navbar';
import BarChart from '@/components/BarChart';
import HorizontalBar from '@/components/HorizontalBar';
import { Activity, Clock, AlertTriangle, Zap, BarChart3 } from 'lucide-react';
import {
  getAnalyticsSummary,
  getRequestsByEndpoint,
  getRequestsByApiKey,
  getHourlyTrend,
  getDailyTrend,
  getResponseTimeByEndpoint,
  getRecentErrors,
} from '@/data/analytics';

export const metadata = { title: 'API 分析面板 - 罕见病联盟' };
export const dynamic = 'force-dynamic';

function StatCard({ icon: Icon, label, value, sub, color = 'text-white' }) {
  return (
    <div className="bg-surface-800 border border-surface-600 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-gray-500" />
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <p className={`text-2xl md:text-3xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

function Section({ title, children, className = '' }) {
  return (
    <div className={`bg-surface-800 border border-surface-600 rounded-2xl p-6 ${className}`}>
      <h3 className="text-sm font-semibold text-gray-400 mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function DashboardPage() {
  let summary, byEndpoint, hourlyTrend, dailyTrend, topApiKeys, responseTime, recentErrors;

  try {
    summary = getAnalyticsSummary();
    byEndpoint = getRequestsByEndpoint(7);
    hourlyTrend = getHourlyTrend(1);
    dailyTrend = getDailyTrend(30);
    topApiKeys = getRequestsByApiKey(7);
    responseTime = getResponseTimeByEndpoint(7);
    recentErrors = getRecentErrors(10);
  } catch {
    summary = { total: 0, today: 0, errorRate: 0, avgResponseMs: 0 };
    byEndpoint = [];
    hourlyTrend = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
    dailyTrend = [];
    topApiKeys = [];
    responseTime = [];
    recentErrors = [];
  }

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <BarChart3 className="w-7 h-7 text-primary-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">API 分析面板</h1>
            <p className="text-sm text-gray-500">实时监控 API 使用情况</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Activity} label="总请求" value={summary.total.toLocaleString()} color="text-white" />
          <StatCard icon={Zap} label="今日请求" value={summary.today.toLocaleString()} color="text-sky-400" />
          <StatCard icon={AlertTriangle} label="错误率" value={`${summary.errorRate}%`} color={summary.errorRate > 5 ? 'text-red-400' : 'text-emerald-400'} />
          <StatCard icon={Clock} label="平均响应" value={`${summary.avgResponseMs}ms`} color="text-primary-400" />
        </div>

        {/* Charts Row 1: Trends */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Section title="每日趋势（30天）">
            <BarChart
              data={dailyTrend.map(d => ({ label: d.day.slice(5), value: d.count }))}
              color="bg-sky-400"
              height="h-36"
            />
          </Section>
          <Section title="24 小时分布">
            <BarChart
              data={hourlyTrend.map(d => ({ label: `${d.hour}`, value: d.count }))}
              color="bg-primary-400"
              height="h-36"
            />
          </Section>
        </div>

        {/* Charts Row 2: Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Section title="按端点统计（7天）">
            <HorizontalBar
              data={byEndpoint.map(d => ({ label: d.endpoint, value: d.count }))}
              color="bg-sky-400"
            />
          </Section>
          <Section title="响应时间（7天）">
            <HorizontalBar
              data={responseTime.map(d => ({ label: d.endpoint, value: d.avg }))}
              color="bg-primary-400"
              unit="ms"
            />
          </Section>
        </div>

        {/* Row 3: Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Section title="Top API Keys（7天）">
            {topApiKeys.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">暂无 API Key 调用记录</p>
            ) : (
              <div className="space-y-2">
                {topApiKeys.map((k, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <code className="text-xs text-gray-400 font-mono">{k.apiKeyId}</code>
                    <span className="text-white font-medium">{k.count} 次</span>
                  </div>
                ))}
              </div>
            )}
          </Section>
          <Section title="最近错误">
            {recentErrors.length === 0 ? (
              <p className="text-emerald-400 text-sm text-center py-4">没有错误记录</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recentErrors.map((e, i) => (
                  <div key={i} className="text-xs border-b border-surface-600 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-red-400 font-mono font-bold">{e.status}</span>
                      <span className="text-gray-400 font-mono">{e.method}</span>
                      <span className="text-gray-300 truncate">{e.path}</span>
                    </div>
                    {e.errorMessage && (
                      <p className="text-gray-500 mt-0.5 truncate">{e.errorMessage}</p>
                    )}
                    <p className="text-gray-600 text-[10px]">{e.createdAt}</p>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      </main>
    </>
  );
}
