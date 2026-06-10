"use client";

// Global picture-in-picture mini-player (root layout). When a viewer who was
// in a room browses to any other page, their room keeps playing in a floating
// window bottom-right — click it to jump straight back, ✕ to dismiss.
//
//   • Members keep the stream WITH sound while they browse.
//   • The HOST keeps broadcasting: the mini-player reconnects with their
//     publish token and re-enables the camera, so navigating away no longer
//     kills the stream for the whole room.
//   • Logged-out visitors get the muted preview, same as in-room.
//
// It also heartbeats `touch_room` so a room being watched from the mini-player
// never counts as inactive (inactive rooms are auto-deleted after 5 minutes).

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import "@livekit/components-styles";
import { LiveKitRoom, RoomAudioRenderer, GridLayout, ParticipantTile, useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";
import { createClient } from "@/lib/supabase/client";
import { subscribeActiveRoom, getActiveRoomRaw, clearActiveRoom, type ActiveRoom } from "@/lib/activeRoom";

const HEARTBEAT_MS = 60_000;

function MiniStage({ role }: { role: ActiveRoom["role"] }) {
  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: false }]);
  const live = tracks.length > 0;
  return (
    <div className="relative aspect-video bg-black">
      {live ? (
        <GridLayout tracks={tracks}>
          <ParticipantTile />
        </GridLayout>
      ) : (
        <div className="flex h-full items-center justify-center px-4 text-center text-xs text-white/50">
          {role === "host" ? "Reconnecting your camera…" : "Waiting for the host's camera…"}
        </div>
      )}
      {live && <span className="live-badge absolute left-2 top-2 z-10">● LIVE</span>}
      {live && role === "preview" && (
        <span className="absolute bottom-2 left-2 z-10 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white/90">
          Muted preview
        </span>
      )}
      {role !== "preview" && <RoomAudioRenderer />}
    </div>
  );
}

export function MiniPlayer() {
  const pathname = usePathname();
  const router = useRouter();

  // The active room lives in localStorage; the room page / leave button /
  // dismiss all write it and emit a change event — no polling, no prop drilling.
  const raw = useSyncExternalStore(subscribeActiveRoom, getActiveRoomRaw, () => null);
  const room = useMemo<ActiveRoom | null>(() => {
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as ActiveRoom;
      return parsed && typeof parsed.roomId === "string" ? parsed : null;
    } catch {
      return null;
    }
  }, [raw]);

  const onRoomPage = !!room && pathname === `/rooms/${room.roomId}`;
  const visible = !!room && !onRoomPage;

  // LiveKit connection details, tagged with their room so a stale token for a
  // previous room is never used (state only ever set from async callbacks).
  const [conn, setConn] = useState<{ roomId: string; token: string; url: string } | null>(null);
  const connReady = !!conn && !!room && conn.roomId === room.roomId;

  useEffect(() => {
    if (!visible || !room || connReady) return;
    let active = true;
    (async () => {
      try {
        const qs = room.role === "preview" ? `roomId=${room.roomId}&preview=1` : `roomId=${room.roomId}`;
        const res = await fetch(`/api/livekit/token?${qs}`);
        const data = await res.json();
        if (!active) return;
        if (!res.ok) {
          clearActiveRoom(room.roomId); // room gone (auto-deleted/closed) — drop the player
          return;
        }
        setConn({ roomId: room.roomId, token: data.token, url: data.url });
      } catch {
        /* leave conn as-is; the player simply stays hidden */
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, room?.roomId, room?.role, connReady]);

  // Keep the room marked active while it plays in the corner.
  useEffect(() => {
    if (!visible || !room) return;
    const supabase = createClient();
    const beat = () => void supabase.rpc("touch_room", { p_room_id: room.roomId });
    beat();
    const timer = setInterval(beat, HEARTBEAT_MS);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, room?.roomId]);

  if (!visible || !room || !connReady || !conn) return null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/rooms/${room.roomId}`)}
      onKeyDown={(e) => e.key === "Enter" && router.push(`/rooms/${room.roomId}`)}
      className="fixed bottom-4 right-4 z-40 w-60 cursor-pointer overflow-hidden rounded-xl border border-line bg-ink shadow-2xl shadow-black/60 transition hover:border-accent/60 sm:w-72"
      aria-label={`Return to ${room.title}`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-line bg-ink-deep px-3 py-1.5">
        <p className="min-w-0 truncate text-xs font-bold text-ink-foreground">{room.title}</p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            clearActiveRoom();
          }}
          aria-label="Close mini player"
          className="shrink-0 rounded px-1.5 text-sm leading-none text-muted transition hover:bg-surface-2 hover:text-ink-foreground"
        >
          ✕
        </button>
      </div>
      {/* Hosts auto re-publish camera + mic so the stream survives navigation. */}
      <LiveKitRoom
        token={conn.token}
        serverUrl={conn.url}
        connect
        video={room.role === "host"}
        audio={room.role === "host"}
      >
        <MiniStage role={room.role} />
      </LiveKitRoom>
      <p className="border-t border-line bg-ink-deep px-3 py-1.5 text-[10px] text-muted">
        Click to return to the room
      </p>
    </div>
  );
}
