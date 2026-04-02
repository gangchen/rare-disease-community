import { NextResponse } from 'next/server';
import { authenticate, authError } from '@/lib/middleware';
import { withLogging } from '@/lib/apiLogger';
import {
  getAnalyticsSummary,
  getRequestsByEndpoint,
  getRequestsByApiKey,
  getHourlyTrend,
  getDailyTrend,
  getResponseTimeByEndpoint,
  getRecentErrors,
} from '@/data/analytics';

// GET /api/analytics?range=7 (days, default 7)
// Requires admin role
async function handleGET(request) {
  const auth = authenticate(request);
  if (auth.error) return authError(auth);

  if (auth.role !== 'admin') {
    return NextResponse.json({ error: '需要管理员权限' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('range') || '7');

  try {
    const summary = getAnalyticsSummary();
    const byEndpoint = getRequestsByEndpoint(days);
    const hourlyTrend = getHourlyTrend(1);
    const dailyTrend = getDailyTrend(days);
    const topApiKeys = getRequestsByApiKey(days);
    const responseTime = getResponseTimeByEndpoint(days);
    const recentErrors = getRecentErrors(20);

    return NextResponse.json({
      summary,
      byEndpoint,
      hourlyTrend,
      dailyTrend,
      topApiKeys,
      responseTime,
      recentErrors,
    });
  } catch (err) {
    return NextResponse.json({ error: '获取分析数据失败' }, { status: 500 });
  }
}

export const GET = withLogging(handleGET, 'analytics');
