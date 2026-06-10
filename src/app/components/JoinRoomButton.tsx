"use client";

// Join / leave a room. Writes to room_members (RLS ensures you only add/remove
// yourself), then refreshes the server-rendered page so membership-gated UI
// (the chat composer) updates.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function JoinRoomButton({
  roomId,
  isMember,
  isLoggedIn,
  isClosed = false,
  joining = false,
}: {
  roomId: string;
  isMember: boolean;
  isLoggedIn: boolean;
  isClosed?: boolean;
  /** AutoJoinRoom is adding this user right now — show progress, not a button. */
  joining?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isClosed) {
    return (
      <span className="inline-flex rounded-lg border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-muted">
        Room closed
      </span>
    );
  }

  if (!isLoggedIn) {
    return (
      <Link
        href="/login"
        className="inline-flex rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-soft"
      >
        Log in to join
      </Link>
    );
  }

  if (joining && !isMember) {
    return (
      <span className="inline-flex rounded-lg border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-muted">
        Joining…
      </span>
    );
  }

  const toggle = async () => {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) {
      router.push("/login");
      return;
    }
    const { error: dbError } = isMember
      ? await supabase.from("room_members").delete().eq("room_id", roomId).eq("user_id", user.id)
      : await supabase.from("room_members").insert({ room_id: roomId, user_id: user.id });
    setBusy(false);
    if (dbError) {
      setError(isMember ? "Couldn't leave the room — try again." : "Couldn't join the room — try again.");
      return;
    }
    router.refresh();
  };

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        onClick={toggle}
        disabled={busy}
        className={`inline-flex rounded-lg px-6 py-3 text-sm font-semibold transition disabled:opacity-60 ${
          isMember
            ? "border border-white/20 bg-white/5 text-white hover:bg-white/10"
            : "bg-accent text-white hover:bg-accent-soft"
        }`}
      >
        {busy ? "…" : isMember ? "Leave room" : "Join room"}
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </span>
  );
}
