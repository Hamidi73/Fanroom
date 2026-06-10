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
  const [error, setError] = useState<string | null>(null);
  const closed = status === "Closed";

  const setStatus = async (next: string) => {
    setBusy(true);
    setError(null);
    const { error: dbErr } = await createClient().from("rooms").update({ status: next }).eq("id", roomId);
    setBusy(false);
    if (dbErr) {
      setError("Couldn't update room status — try again.");
      return;
    }
    router.refresh();
  };

  const remove = async () => {
    if (!confirm("Delete this room permanently? Its chat and members will be removed.")) return;
    setBusy(true);
    setError(null);
    const { error: dbErr } = await createClient().from("rooms").delete().eq("id", roomId);
    if (dbErr) {
      setBusy(false);
      setError("Couldn't delete the room — try again.");
      return;
    }
    router.push("/rooms");
    router.refresh();
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[1.25rem] border border-line bg-white/5 px-4 py-3">
      <span className="text-xs uppercase tracking-[0.25em] text-muted">Host controls</span>
      {closed ? (
        <button
          onClick={() => setStatus("Live Soon")}
          disabled={busy}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-soft disabled:opacity-60"
        >
          Reopen room
        </button>
      ) : (
        <button
          onClick={() => setStatus("Closed")}
          disabled={busy}
          className="rounded-lg border border-line bg-surface-2 px-4 py-2 text-sm font-semibold text-muted transition hover:bg-surface disabled:opacity-60"
        >
          Close room
        </button>
      )}
      <button
        onClick={remove}
        disabled={busy}
        className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/20 disabled:opacity-60"
      >
        Delete room
      </button>
      {error && <p className="w-full text-xs text-red-400">{error}</p>}
    </div>
  );
}
