// Live scoreboard feed for the sidebar group rail (GroupFixtures polls this).
// The heavy lifting is already cached server-side by the fixture fetches
// (schedule 60s, scoreboard 30s), so polling this every ~45s is cheap — it
// never hits the external sources more than the revalidate windows allow.

import { NextResponse } from "next/server";
import { getGroupsToday } from "@/app/data";
import { rateLimit, clientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Generous per-IP cap: the client polls every 30s, so 60/min leaves huge
  // headroom for legit use while blunting a flood that would recompute the
  // grouping on every hit.
  const rl = await rateLimit(`live:${clientIp(request)}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429, headers: { "retry-after": String(rl.retryAfter) } },
    );
  }

  const groups = await getGroupsToday();
  return NextResponse.json(
    { groups },
    { headers: { "cache-control": "public, max-age=30, stale-while-revalidate=60" } },
  );
}
