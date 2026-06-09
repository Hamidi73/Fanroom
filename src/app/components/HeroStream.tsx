"use client";

// Hero panel that plays the LIVE video of the current #1 room (muted preview),
// with an overlay (LIVE badge, viewer count, title, host) and a click-through to
// watch. Falls back to a branded panel when there's no top room yet or its host
// isn't broadcasting.

import { useState } from "react";
import Link from "next/link";
import { LivePreview } from "./LivePreview";
import { getNation } from "@/app/data";
import type { LeaderRoom } from "./RoomLeaderboard";

export function HeroStream({ room }: { room: LeaderRoom | null }) {
  const [live, setLive] = useState(false);
  const nation = room?.nationSlug ? getNation(room.nationSlug) : undefined;

  const gradient = nation
    ? `radial-gradient(circle at 30% 25%, ${nation.theme.accent}, transparent 60%), linear-gradient(150deg, ${nation.theme.border}, #0e0e10 90%)`
    : "radial-gradient(circle at 30% 25%, rgba(145,71,255,0.35), transparent 60%), linear-gradient(150deg, #26203a, #0e0e10 90%)";

  if (!room) {
    return (
      <div
        className="flex aspect-video items-center justify-center rounded-xl border border-line text-center"
        style={{ backgroundImage: gradient }}
      >
        <div className="px-6">
          <p className="text-sm font-bold text-white/80">The top room streams here</p>
          <p className="mt-1 text-xs text-white/50">As fans fill rooms, the #1 goes live in this spot.</p>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`/rooms/${room.id}`}
      className="group relative block aspect-video overflow-hidden rounded-xl border border-line no-underline transition hover:border-accent/60"
    >
      {/* Thumbnail behind the video */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundImage: gradient }}>
        {nation ? (
          <span className="text-6xl drop-shadow-[0_3px_10px_rgba(0,0,0,0.5)]">{nation.flag}</span>
        ) : (
          <span className="text-sm font-semibold text-white/60">{room.title}</span>
        )}
      </div>

      {/* Live video (covers the thumbnail when the host is broadcasting) */}
      <div className="absolute inset-0">
        <LivePreview roomId={room.id} onLiveChange={setLive} />
      </div>

      {/* Readability gradient + overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

      <div className="absolute left-3 top-3 flex items-center gap-2">
        {live ? (
          <span className="live-badge">● Live</span>
        ) : (
          <span className="rounded bg-black/60 px-1.5 py-0.5 text-[11px] font-bold text-white/80">Top room</span>
        )}
        <span className="rounded bg-black/60 px-1.5 py-0.5 text-[11px] font-semibold text-white">
          {room.count} watching
        </span>
      </div>

      <div className="absolute bottom-3 left-3 right-3">
        <p className="truncate text-lg font-bold text-white">{room.title}</p>
        <p className="truncate text-xs text-white/70">{room.hostName}</p>
        <span className="mt-2 inline-flex items-center rounded-lg bg-accent px-4 py-2 text-sm font-bold text-white transition group-hover:bg-accent-strong">
          {live ? "Watch live" : "Open room"}
        </span>
      </div>
    </Link>
  );
}
