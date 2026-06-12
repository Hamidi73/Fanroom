"use client";

// Live "top rooms" leaderboard, ranked by how many fans are in each room. Seeds
// from a server-rendered ranking, then subscribes to Supabase realtime: any
// join/leave (room_members) or room open/close (rooms) re-fetches the counts and
// re-ranks, so the board updates on its own with no page reload.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getNation } from "@/app/data";
import { NationFlag } from "./NationFlag";

export type LeaderRoom = {
  id: string;
  title: string;
  hostName: string;
  nationSlug: string | null;
  count: number;
};

const TOP_N = 5;

export function RoomLeaderboard({ initial }: { initial: LeaderRoom[] }) {
  const [rooms, setRooms] = useState<LeaderRoom[]>(initial);
  const supabaseRef = useRef(createClient());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = supabaseRef.current;

    const refetch = async () => {
      const { data } = await supabase
        .from("rooms")
        .select("id,title,nation_slug,status,host:profiles!rooms_host_id_fkey(display_name),members:room_members(count)")
        .neq("status", "Closed");
      if (!data) return;
      const ranked = (data as unknown as RawRoom[])
        .map((r) => ({
          id: r.id,
          title: r.title,
          nationSlug: r.nation_slug,
          hostName: r.host?.display_name ?? "a creator",
          count: r.members?.[0]?.count ?? 0,
        }))
        .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title))
        .slice(0, TOP_N);
      setRooms(ranked);
    };

    // Coalesce bursts of join/leave events into one refetch.
    const schedule = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(refetch, 400);
    };

    const channel = supabase
      .channel("room-leaderboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "room_members" }, schedule)
      .on("postgres_changes", { event: "*", schema: "public", table: "rooms" }, schedule)
      .subscribe();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <div className="flex items-center justify-between">
        <h2 className="display text-lg">Top rooms right now</h2>
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <span className="live-dot" /> Live
        </span>
      </div>
      <p className="mt-1 text-xs text-muted">Ranked by fans in each room — updates automatically.</p>

      {rooms.length === 0 ? (
        <p className="mt-4 rounded-lg border border-line bg-surface-2 px-4 py-5 text-center text-sm text-muted">
          The most popular rooms will climb here as fans pile in. Be the first to fill one.
        </p>
      ) : (
        <ol className="mt-4 space-y-1.5">
          {rooms.map((r, i) => {
            const nation = r.nationSlug ? getNation(r.nationSlug) : undefined;
            return (
              <li key={r.id}>
                <Link
                  href={`/rooms/${r.id}`}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 no-underline transition hover:bg-surface-2"
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-bold ${
                      i === 0 ? "bg-accent text-black" : "bg-surface-2 text-muted"
                    }`}
                  >
                    {i + 1}
                  </span>
                  {nation && <NationFlag src={nation.flagImg} name={nation.name} width={22} />}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink-foreground">{r.title}</span>
                    <span className="block truncate text-xs text-muted">{r.hostName}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-sm font-bold text-ink-foreground">
                    <ViewerIcon />
                    {r.count}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

type RawRoom = {
  id: string;
  title: string;
  nation_slug: string | null;
  status: string;
  host: { display_name: string } | null;
  members: { count: number }[] | null;
};

function ViewerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="text-muted">
      <circle cx="8" cy="5" r="2.6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2.5 13.5c0-2.5 2.5-4 5.5-4s5.5 1.5 5.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
