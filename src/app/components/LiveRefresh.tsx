"use client";

// Keeps server-rendered content fresh WITHOUT manual reloads (no flicker —
// router.refresh() re-renders server components in place and client state
// survives). Two triggers:
//
//   1. Supabase realtime on `rooms` + `room_members`: a new room appears, a
//      closed/deleted room disappears, member counts move. Heartbeat-only
//      UPDATEs (last_active_at) are filtered out by tracking each room's
//      status — otherwise every viewer's 60s touch_room ping would refresh
//      every open page.
//   2. A gentle interval (default 60s) re-pulls non-realtime data — fixture
//      scores revalidate server-side every minute.
//
// Refreshes are coalesced and skipped while the tab is hidden (it refreshes
// once on return instead).

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LiveRefresh({ intervalMs = 60_000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const statuses = new Map<string, string>(); // roomId → last seen status
    let pending: ReturnType<typeof setTimeout> | null = null;
    let stale = false; // a change arrived while the tab was hidden

    const refresh = () => {
      if (document.visibilityState !== "visible") {
        stale = true;
        return;
      }
      stale = false;
      router.refresh();
    };

    const bump = () => {
      if (pending) return; // coalesce bursts into one refresh
      pending = setTimeout(() => {
        pending = null;
        refresh();
      }, 1200);
    };

    // Seed the status map so the FIRST close/reopen of a long-lived room is
    // recognised as a real change (not mistaken for a heartbeat).
    void supabase
      .from("rooms")
      .select("id,status")
      .then(({ data }) => {
        for (const r of data ?? []) {
          if (!statuses.has(r.id)) statuses.set(r.id, r.status);
        }
      });

    const channel = supabase
      .channel(`live-refresh-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "rooms" }, (payload) => {
        const row = payload.new as { id: string; status: string };
        statuses.set(row.id, row.status);
        bump();
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "rooms" }, () => bump())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "rooms" }, (payload) => {
        const row = payload.new as { id: string; status: string };
        const prev = statuses.get(row.id);
        statuses.set(row.id, row.status);
        if (prev !== row.status) bump(); // closed/reopened — not just a heartbeat
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "room_members" }, () => bump())
      .subscribe();

    const interval = setInterval(refresh, intervalMs);
    const onVisible = () => {
      if (document.visibilityState === "visible" && stale) refresh();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
      if (pending) clearTimeout(pending);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router, intervalMs]);

  return null;
}
