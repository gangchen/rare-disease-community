import { getDb } from '@/lib/db';

function daysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function todayStart() {
  return new Date().toISOString().split('T')[0] + 'T00:00:00.000Z';
}

export function getAnalyticsSummary() {
  const db = getDb();
  const total = db.prepare('SELECT COUNT(*) AS c FROM api_logs').get().c;
  const today = db.prepare('SELECT COUNT(*) AS c FROM api_logs WHERE created_at >= ?').get(todayStart()).c;
  const errors = db.prepare('SELECT COUNT(*) AS c FROM api_logs WHERE status >= 400').get().c;
  const errorRate = total > 0 ? ((errors / total) * 100).toFixed(1) : '0.0';
  const avgRow = db.prepare('SELECT AVG(response_time_ms) AS avg FROM api_logs').get();
  const avgResponseMs = Math.round(avgRow.avg || 0);

  return { total, today, errorRate: parseFloat(errorRate), avgResponseMs };
}

export function getRequestsByEndpoint(days = 7) {
  const db = getDb();
  return db.prepare(
    'SELECT endpoint, COUNT(*) AS count FROM api_logs WHERE created_at >= ? GROUP BY endpoint ORDER BY count DESC'
  ).all(daysAgo(days));
}

export function getRequestsByApiKey(days = 7) {
  const db = getDb();
  return db.prepare(
    'SELECT api_key_id AS apiKeyId, COUNT(*) AS count FROM api_logs WHERE api_key_id IS NOT NULL AND created_at >= ? GROUP BY api_key_id ORDER BY count DESC LIMIT 20'
  ).all(daysAgo(days));
}

export function getHourlyTrend(days = 1) {
  const db = getDb();
  const rows = db.prepare(
    "SELECT CAST(strftime('%H', created_at) AS INTEGER) AS hour, COUNT(*) AS count FROM api_logs WHERE created_at >= ? GROUP BY hour ORDER BY hour"
  ).all(daysAgo(days));

  // Fill missing hours
  const map = Object.fromEntries(rows.map(r => [r.hour, r.count]));
  return Array.from({ length: 24 }, (_, i) => ({ hour: i, count: map[i] || 0 }));
}

export function getDailyTrend(days = 30) {
  const db = getDb();
  return db.prepare(
    "SELECT date(created_at) AS day, COUNT(*) AS count FROM api_logs WHERE created_at >= ? GROUP BY day ORDER BY day"
  ).all(daysAgo(days));
}

export function getResponseTimeByEndpoint(days = 7) {
  const db = getDb();
  return db.prepare(
    'SELECT endpoint, ROUND(AVG(response_time_ms)) AS avg, MAX(response_time_ms) AS max FROM api_logs WHERE created_at >= ? GROUP BY endpoint ORDER BY avg DESC'
  ).all(daysAgo(days));
}

export function getRecentErrors(limit = 20) {
  const db = getDb();
  return db.prepare(
    'SELECT method, path, status, error_message AS errorMessage, created_at AS createdAt FROM api_logs WHERE status >= 400 ORDER BY created_at DESC LIMIT ?'
  ).all(limit);
}
