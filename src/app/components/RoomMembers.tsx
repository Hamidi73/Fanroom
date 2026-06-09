"use client";

// Live "in this room" panel. Seeds from the server-rendered member list, then
// subscribes to Supabase realtime on room_members for THIS room: any join/leave
// (by anyone) re-fetches the list, so the member count and avatars update on
// their own with no page reload. Previously this was static server-rendered
// markup that only changed when the current user themself joined or left.

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type RoomMember = {
  user_id: string;
  display_name: string | null;
};

type MemberRowRaw = {
  user_id: string;
  profiles: { display_name: string } | null;
};

export function RoomMembers({
  roomId,
  hostId,
  initial,
}: {
  roomId: string;
  hostId: string;
  initial: RoomMember[];
}) {
  const [members, setMembers] = useState<RoomMember[]>(initial);
  const supabaseRef = useRef(createClient());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = supabaseRef.current;

    const refetch = async () => {
      const { data } = await supabase
        .from("room_members")
        .select("user_id,profiles(display_name)")
        .eq("room_id", roomId);
      if (!data) return;
      setMembers(
        (data as unknown as MemberRowRaw[]).map((m) => ({
          user_id: m.user_id,
          display_name: m.profiles?.display_name ?? null,
        })),
      );
    };

    // Coalesce bursts of join/leave events into a single refetch.
    const schedule = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(refetch, 300);
    };

    const channel = supabase
      .channel(`room-members-${roomId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "room_members", filter: `room_id=eq.${roomId}` },
        schedule,
      )
      .subscribe();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  return (
    <>
      <p className="text-xs font-bold uppercase tracking-wide text-muted">In this room</p>
      <h2 className="mt-2 text-lg font-bold text-white">
        {members.length} member{members.length === 1 ? "" : "s"}
      </h2>
      <ul className="mt-4 space-y-2">
        {members.length === 0 ? (
          <li className="text-sm text-muted">No one has joined yet.</li>
        ) : (
          members.map((m) => (
            <li
              key={m.user_id}
              className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm text-ink-foreground"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent-soft">
                {(m.display_name ?? "F").slice(0, 1).toUpperCase()}
              </span>
              {m.display_name ?? "Fan"}
              {m.user_id === hostId && <span className="text-xs text-accent">host</span>}
            </li>
          ))
        )}
      </ul>
    </>
  );
}

// Compact live member count (e.g. the hero badge), sharing the same realtime
// trigger so it stays in sync with the panel above.
export function RoomMemberCount({ roomId, initial }: { roomId: string; initial: number }) {
  const [count, setCount] = useState(initial);
  const supabaseRef = useRef(createClient());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = supabaseRef.current;

    const refetch = async () => {
      const { count: c } = await supabase
        .from("room_members")
        .select("user_id", { count: "exact", head: true })
        .eq("room_id", roomId);
      if (typeof c === "number") setCount(c);
    };

    const schedule = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(refetch, 300);
    };

    const channel = supabase
      .channel(`room-member-count-${roomId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "room_members", filter: `room_id=eq.${roomId}` },
        schedule,
      )
      .subscribe();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  return <>{count} joined</>;
}
