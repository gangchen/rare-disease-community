// Simple in-memory rate limiter
// Tracks requests per IP/key in a sliding window

const store = new Map();

const CLEANUP_INTERVAL = 60 * 1000; // 1 minute
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now - entry.windowStart > entry.windowMs * 2) {
      store.delete(key);
    }
  }
}

/**
 * Check rate limit
 * @param {string} key - Identifier (IP, API key, etc.)
 * @param {object} opts - { maxRequests, windowMs }
 * @returns {{ allowed: boolean, remaining: number, resetMs: number }}
 */
export function checkRateLimit(key, { maxRequests = 60, windowMs = 60 * 1000 } = {}) {
  cleanup();
  const now = Date.now();
  let entry = store.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    entry = { count: 0, windowStart: now, windowMs };
    store.set(key, entry);
  }

  entry.count++;
  const remaining = Math.max(0, maxRequests - entry.count);
  const resetMs = entry.windowStart + windowMs - now;

  return {
    allowed: entry.count <= maxRequests,
    remaining,
    resetMs,
  };
}

/**
 * Get client identifier from request
 */
export function getClientId(request) {
  const authHeader = request.headers.get('authorization') || '';
  if (authHeader.startsWith('ApiKey ')) return `key:${authHeader.slice(7, 20)}`;
  if (authHeader.startsWith('Bearer ')) return `token:${authHeader.slice(7, 20)}`;
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return `ip:${ip}`;
}

// Rate limit configs
export const RATE_LIMITS = {
  read: { maxRequests: 120, windowMs: 60 * 1000 },    // 120/min for reads
  write: { maxRequests: 30, windowMs: 60 * 1000 },     // 30/min for writes
  auth: { maxRequests: 10, windowMs: 60 * 1000 },      // 10/min for auth
};
