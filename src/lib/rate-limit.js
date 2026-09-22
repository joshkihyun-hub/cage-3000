// Rate limiter with a shared store when one is configured.
//
// With Upstash Redis env vars set (Vercel's Upstash integration adds
// KV_REST_API_URL / KV_REST_API_TOKEN; UPSTASH_REDIS_REST_* also work), every
// serverless instance counts against the same Redis key — a real global cap.
// Without them, or if Redis is unreachable, it falls back to the per-instance
// in-memory sliding window: a soft limit that still blunts a single client.

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY_PREFIX = 'rl:';

const buckets = new Map(); // key -> number[] of request timestamps (ms)

// Per-instance sliding window (the original limiter, now the fallback).
function memoryRateLimit(key, { limit, windowMs }) {
  const now = Date.now();
  const cutoff = now - windowMs;
  const recent = (buckets.get(key) || []).filter((t) => t > cutoff);

  if (recent.length >= limit) {
    buckets.set(key, recent);
    const retryAfter = Math.max(1, Math.ceil((recent[0] + windowMs - now) / 1000));
    return { ok: false, remaining: 0, retryAfter };
  }

  recent.push(now);
  buckets.set(key, recent);

  // Opportunistic GC so abandoned keys don't accumulate forever.
  if (buckets.size > 5000) {
    for (const [k, ts] of buckets) {
      if (ts.length === 0 || ts[ts.length - 1] <= cutoff) buckets.delete(k);
    }
  }

  return { ok: true, remaining: limit - recent.length };
}

// Fixed window in Redis: INCR the key, start its TTL on the first hit only
// (PEXPIRE NX), and read the TTL back for Retry-After. One round trip.
async function redisRateLimit(key, { limit, windowMs }) {
  const k = `${KEY_PREFIX}${key}`;
  const res = await fetch(`${REDIS_URL}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([
      ['INCR', k],
      ['PEXPIRE', k, String(windowMs), 'NX'],
      ['PTTL', k],
    ]),
    cache: 'no-store',
    // A slow Redis must never hold up login or checkout.
    signal: AbortSignal.timeout(1500),
  });
  if (!res.ok) throw new Error(`redis ${res.status}`);
  const [incr, , pttl] = await res.json();
  if (incr?.error) throw new Error(incr.error);

  const count = Number(incr.result);
  if (count > limit) {
    const ttl = Number(pttl?.result);
    const retryAfter = Math.max(1, Math.ceil((ttl > 0 ? ttl : windowMs) / 1000));
    return { ok: false, remaining: 0, retryAfter };
  }
  return { ok: true, remaining: limit - count };
}

/**
 * Records a hit for `key` and reports whether it's within the allowed rate.
 * @returns {Promise<{ ok: boolean, remaining: number, retryAfter?: number }>}
 */
export async function rateLimit(key, opts) {
  if (REDIS_URL && REDIS_TOKEN) {
    try {
      return await redisRateLimit(key, opts);
    } catch (err) {
      console.warn('[rate-limit] redis unavailable, using in-memory fallback', err?.message);
    }
  }
  return memoryRateLimit(key, opts);
}

// Best-effort client IP from common proxy headers (Vercel sets x-forwarded-for).
// Accepts a Web Request (headers.get) or NextAuth's authorize() req, whose
// headers are a plain object.
export function getClientIp(req) {
  const h = req?.headers;
  const get = (name) => (typeof h?.get === 'function' ? h.get(name) : h?.[name]);
  const xff = get('x-forwarded-for');
  if (xff) return String(xff).split(',')[0].trim();
  return get('x-real-ip') || 'unknown';
}
