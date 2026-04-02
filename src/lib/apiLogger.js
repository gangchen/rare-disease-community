import { getDb } from '@/lib/db';

// In-memory buffer for batched inserts
const buffer = [];
const FLUSH_INTERVAL = 5000; // 5 seconds
const FLUSH_SIZE = 50;
const RETENTION_DAYS = 90;

let flushTimer = null;

function ensureTimer() {
  if (!flushTimer) {
    flushTimer = setInterval(() => {
      flush();
      cleanOldLogs();
    }, FLUSH_INTERVAL);
    if (flushTimer.unref) flushTimer.unref();
  }
}

function flush() {
  if (buffer.length === 0) return;
  try {
    const db = getDb();
    const insert = db.prepare(
      'INSERT INTO api_logs (method, path, endpoint, status, response_time_ms, api_key_id, user_id, ip, error_message, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const batch = db.transaction((entries) => {
      for (const e of entries) {
        insert.run(e.method, e.path, e.endpoint, e.status, e.responseTimeMs, e.apiKeyId, e.userId, e.ip, e.errorMessage, e.createdAt);
      }
    });
    batch(buffer.splice(0));
  } catch {
    // Silently ignore DB errors (table may not exist yet)
  }
}

let lastCleanup = 0;
function cleanOldLogs() {
  const now = Date.now();
  if (now - lastCleanup < 24 * 60 * 60 * 1000) return; // Once per day
  lastCleanup = now;
  try {
    const db = getDb();
    const cutoff = new Date(now - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
    db.prepare('DELETE FROM api_logs WHERE created_at < ?').run(cutoff);
  } catch {
    // ignore
  }
}

function getEndpoint(path) {
  const segments = path.replace(/^\/api\//, '').split('/');
  return segments[0] || 'unknown';
}

function getClientInfo(request) {
  const authHeader = request.headers.get('authorization') || '';
  let apiKeyId = null;
  let userId = null;

  if (authHeader.startsWith('ApiKey ')) {
    apiKeyId = authHeader.slice(7, 19);
  }

  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

  return { apiKeyId, userId, ip };
}

/**
 * Higher-order function to wrap route handlers with logging
 */
export function withLogging(handler, endpointOverride) {
  return async function loggedHandler(request, context) {
    const start = Date.now();
    let response;
    try {
      response = await handler(request, context);
    } catch (err) {
      const elapsed = Date.now() - start;
      const url = new URL(request.url);
      const client = getClientInfo(request);
      buffer.push({
        method: request.method,
        path: url.pathname,
        endpoint: endpointOverride || getEndpoint(url.pathname),
        status: 500,
        responseTimeMs: elapsed,
        apiKeyId: client.apiKeyId,
        userId: client.userId,
        ip: client.ip,
        errorMessage: err.message || 'Internal Server Error',
        createdAt: new Date().toISOString(),
      });
      ensureTimer();
      if (buffer.length >= FLUSH_SIZE) flush();
      throw err;
    }

    const elapsed = Date.now() - start;
    const url = new URL(request.url);
    const client = getClientInfo(request);
    const status = response.status;

    let errorMessage = null;
    if (status >= 400) {
      try {
        const cloned = response.clone();
        const body = await cloned.json();
        errorMessage = body.error || JSON.stringify(body);
      } catch {
        errorMessage = `HTTP ${status}`;
      }
    }

    buffer.push({
      method: request.method,
      path: url.pathname,
      endpoint: endpointOverride || getEndpoint(url.pathname),
      status,
      responseTimeMs: elapsed,
      apiKeyId: client.apiKeyId,
      userId: client.userId,
      ip: client.ip,
      errorMessage,
      createdAt: new Date().toISOString(),
    });

    ensureTimer();
    if (buffer.length >= FLUSH_SIZE) flush();

    return response;
  };
}
