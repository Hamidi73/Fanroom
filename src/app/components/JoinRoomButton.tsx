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
}: {
  roomId: string;
  isMember: boolean;
  isLoggedIn: boolean;
  isClosed?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (isClosed) {
    return (
      <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-muted">
        Room closed
      </span>
    );
  }

  if (!isLoggedIn) {
    return (
      <Link
        href="/login"
        className="inline-flex rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300"
      >
        Log in to join
      </Link>
    );
  }

  const toggle = async () => {
    setBusy(true);
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) {
      router.push("/login");
      return;
    }
    if (isMember) {
      await supabase.from("room_members").delete().eq("room_id", roomId).eq("user_id", user.id);
    } else {
      await supabase.from("room_members").insert({ room_id: roomId, user_id: user.id });
    }
    setBusy(false);
    router.refresh();
  };

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`inline-flex rounded-full px-6 py-3 text-sm font-semibold transition disabled:opacity-60 ${
        isMember
          ? "border border-white/20 bg-white/5 text-white hover:bg-white/10"
          : "bg-emerald-400 text-black hover:bg-emerald-300"
      }`}
    >
      {busy ? "…" : isMember ? "Leave room" : "Join room"}
    </button>
  );
}
