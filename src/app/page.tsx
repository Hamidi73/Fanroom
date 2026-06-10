// Homepage (Server Component). Fetches real upcoming fixtures from the schedule
// API and the current top fan rooms from Supabase, then hands them to the client
// shell which owns the language switcher. When rooms exist they're featured front
// and centre; until then the client shows inviting placeholders.

import { getUpcomingFixtures } from "@/app/data";
import { createClient } from "@/lib/supabase/server";
import { LiveRefresh, type RoomCardData } from "@/app/components";
import { HomeClient } from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();

  const [fixtures, roomsRes] = await Promise.all([
    getUpcomingFixtures(9),
    supabase
      .from("rooms")
      .select(
        "id,title,match,nation_slug,language,status,created_at,host_id,host:profiles!rooms_host_id_fkey(display_name),members:room_members(count)",
      )
      .neq("status", "Closed")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const rooms = (roomsRes.data ?? []) as unknown as RoomCardData[];

  return (
    <>
      {/* New rooms, closed rooms, member counts and fixture scores update
          live — no manual reload needed. */}
      <LiveRefresh />
      <HomeClient fixtures={fixtures} rooms={rooms} />
    </>
  );
}
