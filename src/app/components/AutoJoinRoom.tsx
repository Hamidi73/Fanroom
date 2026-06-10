"use client";

// Instant join: opening an open room while signed in makes you a member
// automatically — no separate "Join room" click (the Twitch pattern: clicking
// a stream IS joining it). Runs once on mount (real navigations only — link
// prefetch never mounts client components, so hovering a card can't join you).
// Logged-out visitors take the same one-click path and land on the muted
// preview; the JoinRoomButton stays as the "Leave room" control for members.

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AutoJoinRoom({ roomId }: { roomId: string }) {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const join = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) return;
      const { error } = await supabase
        .from("room_members")
        .insert({ room_id: roomId, user_id: user.id });
      // 23505 = already a member (raced with another tab) — that's fine.
      if (!error || error.code === "23505") router.refresh();
    };
    void join();
  }, [roomId, router]);

  return null;
}
