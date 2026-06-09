"use client";

// Host-only controls for a room: close (end) it, reopen it, or delete it.
// Row-level security already restricts these to the room's host, so a plain
// client update/delete is safe — a non-host's request is rejected by the DB.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function RoomHostControls({ roomId, status }: { roomId: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const closed = status === "Closed";

  const setStatus = async (next: string) => {
    setBusy(true);
    await createClient().from("rooms").update({ status: next }).eq("id", roomId);
    setBusy(false);
    router.refresh();
  };

  const remove = async () => {
    if (!confirm("Delete this room permanently? Its chat and members will be removed.")) return;
    setBusy(true);
    await createClient().from("rooms").delete().eq("id", roomId);
    router.push("/rooms");
    router.refresh();
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3">
      <span className="text-xs uppercase tracking-[0.25em] text-muted">Host controls</span>
      {closed ? (
        <button
          onClick={() => setStatus("Live Soon")}
          disabled={busy}
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-soft disabled:opacity-60"
        >
          Reopen room
        </button>
      ) : (
        <button
          onClick={() => setStatus("Closed")}
          disabled={busy}
          className="rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-400/20 disabled:opacity-60"
        >
          Close room
        </button>
      )}
      <button
        onClick={remove}
        disabled={busy}
        className="rounded-full border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/20 disabled:opacity-60"
      >
        Delete room
      </button>
    </div>
  );
}
