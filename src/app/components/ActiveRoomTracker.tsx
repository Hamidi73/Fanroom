"use client";

// Mounted on every room page. Two jobs:
//   1. Remember this room (localStorage) so the global MiniPlayer can keep the
//      stream playing as a floating window when the viewer browses away.
//   2. Heartbeat `touch_room` — the HOST's heartbeat (p_is_host) is what keeps
//      a room open. A room is auto-deleted 5 minutes after the host stops
//      being present (left without closing, or the room emptied out).

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { setActiveRoom, clearActiveRoom, type ActiveRoomRole } from "@/lib/activeRoom";

// Beat well inside the 5-minute close window so even a throttled background
// tab keeps a present host's room alive.
const HEARTBEAT_MS = 30_000;

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
    const isHost = role === "host";
    const beat = () => void supabase.rpc("touch_room", { p_room_id: roomId, p_is_host: isHost });
    beat();
    const timer = setInterval(beat, HEARTBEAT_MS);
    // Catch up immediately when returning to a tab that had timers throttled.
    const onVisible = () => {
      if (document.visibilityState === "visible") beat();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [roomId, title, role, closed]);

  return null;
}
