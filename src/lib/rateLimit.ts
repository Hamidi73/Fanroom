// Rate limiter (fixed window). Uses Redis when REDIS_URL is configured — a real,
// distributed limit shared across all serverless instances — and transparently
// falls back to a best-effort in-memory limit otherwise (and if Redis errors).
//
// Same code, any Redis: Upstash / DigitalOcean Managed Redis / droplet Redis.
import { getRedis } from "./redis";

type Result = { ok: boolean; retryAfter: number };

// ── In-memory fallback (per-instance only) ─────────────────────────────────
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function memoryLimit(key: string, max: number, windowMs: number): Result {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  if (b.count >= max) return { ok: false, retryAfter: Math.ceil((b.resetAt - now) / 1000) };
  b.count += 1;
  return { ok: true, retryAfter: 0 };
}

// ── Public API ─────────────────────────────────────────────────────────────
export async function rateLimit(key: string, max: number, windowMs: number): Promise<Result> {
  const redis = getRedis();
  if (redis) {
    try {
      const rkey = `rl:${key}`;
      const n = await redis.incr(rkey);
      if (n === 1) await redis.pexpire(rkey, windowMs);
      if (n > max) {
        const ttl = await redis.pttl(rkey);
        return { ok: false, retryAfter: Math.max(1, Math.ceil(ttl / 1000)) };
      }
      return { ok: true, retryAfter: 0 };
    } catch {
      // Redis unreachable — degrade to in-memory rather than fail the request.
    }
  }
  return memoryLimit(key, max, windowMs);
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  return (xff?.split(",")[0] ?? "").trim() || "unknown";
}
