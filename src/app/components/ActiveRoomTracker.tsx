"use client";

// Mounted on every room page. Two jobs:
//   1. Remember this room (localStorage) so the global MiniPlayer can keep the
//      stream playing as a floating window when the viewer browses away.
//   2. Heartbeat `touch_room` every minute — rooms with no heartbeat and no
//      chat for 5 minutes are auto-deleted by the database cron job.

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { setActiveRoom, clearActiveRoom, type ActiveRoomRole } from "@/lib/activeRoom";

const HEARTBEAT_MS = 60_000;

export function ActiveRoomTracker({
  roomId,
  title,
  role,
  closed = false,
}: {
  roomId: string;
  title: string;
  role: ActiveRoomRole;
  closed?: boolean;
}) {
  useEffect(() => {
    if (closed) {
      clearActiveRoom(roomId); // closed rooms shouldn't follow you around
      return;
    }
    setActiveRoom({ roomId, title, role });

    const supabase = createClient();
    const beat = () => void supabase.rpc("touch_room", { p_room_id: roomId });
    beat();
    const timer = setInterval(beat, HEARTBEAT_MS);
    return () => clearInterval(timer);
  }, [roomId, title, role, closed]);

  return null;
}
