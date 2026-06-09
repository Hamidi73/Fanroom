// Shared Redis client (ioredis). Connects from a single REDIS_URL, so the same
// code works against any standard Redis — Upstash (rediss://… URL), DigitalOcean
// Managed Redis, or Redis running on a droplet. Returns null when REDIS_URL is
// unset, so callers transparently fall back (e.g. to an in-memory limiter).
//
// Migration note: moving Redis providers is a REDIS_URL change only — no code.
import Redis from "ioredis";

let client: Redis | null | undefined;

export function getRedis(): Redis | null {
  if (client !== undefined) return client;
  const url = process.env.REDIS_URL;
  if (!url) {
    client = null;
    return null;
  }
  client = new Redis(url, {
    maxRetriesPerRequest: 2,
    enableOfflineQueue: false,
    lazyConnect: false,
  });
  // Swallow connection errors so a Redis outage never crashes a request; callers
  // catch per-operation and fall back.
  client.on("error", () => {});
  return client;
}
