// Live scoreboard feed for the sidebar group rail (GroupFixtures polls this).
// The heavy lifting is already cached server-side by the fixture fetches
// (schedule 60s, scoreboard 30s), so polling this every ~45s is cheap — it
// never hits the external sources more than the revalidate windows allow.

import { NextResponse } from "next/server";
import { getGroupsToday } from "@/app/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const groups = await getGroupsToday();
  return NextResponse.json(
    { groups },
    { headers: { "cache-control": "public, max-age=30, stale-while-revalidate=60" } },
  );
}
