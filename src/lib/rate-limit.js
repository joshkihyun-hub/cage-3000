// Best-effort in-memory rate limiter (sliding window).
//
// NOTE: in serverless / multi-instance deployments each instance keeps its own
// map, so this is a per-instance soft limit, not a hard global cap. It's enough
// to blunt abuse / accidental loops from a single client. For a strict global
// limit you'd need a shared store (Redis/Upstash) — out of scope for now.

const buckets = new Map(); // key -> number[] of request timestamps (ms)

/**
 * Records a hit for `key` and reports whether it's within the allowed rate.
 * @returns {{ ok: boolean, remaining: number, retryAfter?: number }}
 */
export function rateLimit(key, { limit, windowMs }) {
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

// Best-effort client IP from common proxy headers (Vercel sets x-forwarded-for).
export function getClientIp(req) {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}
